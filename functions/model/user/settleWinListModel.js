/* eslint-disable no-unused-vars */
const { leagueCodebook, leagueDecoder } = require('../../util/modules');
const { date3YMDInfo, getTitlesNextPeriod, moment, NP } = require('../../util/modules');
const { predictionsWinList } = require('../../util/settleModules');
const { checkUserRight, getSeason } = require('../../util/databaseEngine');

const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

// const d = require('debug')('user:settleWinListModel'); // firebase 升級後廢掉了
const util = require('util');
function d(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[user settleWinListModel]', util.format(...args));
  }
}

// 當要判斷細部計算是否正確，可以打開此 pdLog 模式，顯示更清楚計算細節
// const isProgramDebug = false;
// const pdLog = function() {
//   if (isProgramDebug) {
//     console.log.apply(this, arguments);
//   }
// };

async function settleWinList(args) {
  // 1. 管理者才能進行 API 呼叫
  // 2. 需要另一支排程進行
  //    a. 取得 這個星期的星期一日期、這個月第一天日期，更新 上星期、上個月記錄，並清空 本星期、本月記錄 設為 0
  //    b. 賽季開打 更新 上賽季記錄，並清空 本賽季記錄，設為 0
  //    c. 大神計算完畢 更新 上期大神記錄，並清空 本期記錄，設為 0
  // 3.
  //    a. 今日 預測單 區分聯盟 且 比賽 為 有效、比賽結束 且 讓分或大小 有結果(result_flags) 的 預測單
  //       因為比賽跨日結束，會導致再次重算，因此怎麼區分累加計算過的資料不再計算，會是個問題
  //       可能需要條件來重算，減少運算量
  //    b. 將 勝率、勝注、勝場數、總場數 計算結果 今日、周、月、季 先寫入歷史 user__win__lists__history
  //    c. 再從 歷史 將 勝率、勝注 依照累加計算寫入 這星期、這個月、這賽季、本期
  //    d. 再更新 大神售牌標語 titles
  //    !! 比賽結束跨日，結算要判斷 執行日期 不同 開賽日期，意謂 跨日比賽結束，要重算前天勝率、勝注
  //       所以 比賽結束呼叫結算後，要再呼叫這支API，輸入日期為前一天
  // 取消
  // 4. 計算 所有使用者 該聯盟 本月的 總勝注榜排名、總勝率榜排名
  //    先用 sql 計算出來後，之後採用 redis 快取，避免 db 大量計算，如果改用定期計算，會員多時，會對 db 有大量寫入問題

  // 跨年賽季
  // 目前使用 getSeason('2274') 會取得該 賽季年
  // 底下程式撰寫會因為 聯盟不同 產生的賽季年也不同
  // 如果從資料庫取出為 league_id 時，先使用 leagueDecoder 再傳入 leagueCodebook
  // 例： leagueCodebook(leagueDecoder('2274'))

  // 勝率的計算比較特別，需要 總勝數(勝數+敗數) 和 勝數

  const userUid = args.token.uid;
  const datInfo = date3YMDInfo(args.date);
  const begin = datInfo.dateBeginUnix;
  const end = datInfo.dateEndUnix;
  const tp = getTitlesNextPeriod(begin * 1000);
  const period = tp.period;
  const weekOfPeriod = tp.weekPeriod;
  const dayOfYear = toNumber(moment(begin * 1000).format('DDD')); // 日期是 一年中的第幾天
  const week = moment(begin * 1000).week();
  const momentObject = moment(begin * 1000).toObject();
  const month = momentObject.months + 1;
  const floatNumber = 4;

  // !!!! 這個有可能產生跨年賽季問題
  // const season = momentObject.years; // 改成底下取得 league_id 時，從 getSeason(league_id) 取得

  const result = {
    status: {
      1: {
        msg: '使用者-聯盟 歷史勝注勝率資料更新成功！',
        lists: []
      },
      2: {
        msg: '使用者-聯盟 勝注勝率資料更新成功！',
        lists: []
      },
      3: {
        msg: '大神 稱號資料更新成功！',
        lists: []
      }
    }
  };

  const s1 = new Date().getTime();
  // 1.
  // !!!! 記得改成 9
  const checkResult = await checkUserRight(userUid, [1, 2, 9], '130815');
  if (checkResult.code) throw checkResult;

  const s2 = new Date().getTime();
  let s21 = 0;
  let s22 = 0;
  let s23 = 0;
  // 3.
  // a.
  // 注意 !!!  正式有資料後，要把 今日日期區間判斷 打開來
  // rsult_flag： -2 未結算, 0 不算
  const predictMatchInfo = await db.sequelize.query(`
        select prediction.id, prediction.uid, prediction.league_id,
               spread_bets, totals_bets,
               spread_result_flag, totals_result_flag
          from user__predictions prediction, matches
         where prediction.bets_id = matches.bets_id
           and prediction.match_scheduled between :begin and :end
           and matches.flag_prematch = 1
           and matches.status = 0
           and (
                 spread_result_flag != -2 or totals_result_flag != -2 or 
                 spread_result_flag != 0 or totals_result_flag != 0
               )
      `, {
    replacements: {
      begin: begin,
      end: end
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  const resultWinList = predictionsWinList(predictMatchInfo);
  // d('resultWinList: ', resultWinList);

  s21 = new Date().getTime();
  // b.
  // 回寫結果 到 users_win_lists_history 記錄 該日 的 勝率、勝注 並 加上其他值 供以後查詢使用
  // !!!! season_year 取得從 league_id leagueCodeBook 取得

  for (const data of resultWinList) {
    let r = {};
    let err, winListsHistory, created;
    const season = await getSeason(data.league_id);

    // 精確小數位數修正
    data.win_bets = NP.round(data.win_bets, floatNumber);
    data.win_rate = NP.round(data.win_rate, floatNumber);
    data.spread_win_rate = NP.round(data.spread_win_rate, floatNumber);
    data.totals_win_rate = NP.round(data.totals_win_rate, floatNumber);

    try {
      [err, [winListsHistory, created]] = await to(db.Users_WinListsHistory.findOrCreate({
        where: {
          uid: data.uid,
          league_id: data.league_id,
          date_timestamp: begin,
          day_of_year: dayOfYear,
          period: period,
          week_of_period: weekOfPeriod,
          week: week,
          month: month,
          season: season
        },
        defaults: {
          uid: data.uid,
          league_id: data.league_id,
          win_bets: data.win_bets,
          win_rate: data.win_rate,
          matches_count: data.matches_count,
          correct_counts: data.correct_counts,
          fault_counts: data.fault_counts,
          spread_correct_counts: data.spread_correct_counts,
          totals_correct_counts: data.totals_correct_counts,
          spread_fault_counts: data.spread_fault_counts,
          totals_fault_counts: data.totals_fault_counts,
          spread_win_rate: data.spread_win_rate,
          totals_win_rate: data.totals_win_rate,
          spread_correct_bets: data.spread_correct_bets,
          totals_correct_bets: data.totals_correct_bets,
          spread_fault_bets: data.spread_fault_bets,
          totals_fault_bets: data.totals_fault_bets,
          spread_win_bets: data.spread_win_bets,
          totals_win_bets: data.totals_win_bets,
          date_timestamp: begin,
          day_of_year: dayOfYear,
          period: period,
          week_of_period: weekOfPeriod,
          week: week,
          month: month,
          season: season
        }
      }));
    } catch (e) {console.error(err); throw errs.dbErrsMsg('404', '13327', { addMsg: err.parent.code });}
    // if (err) {console.error(err); throw errs.dbErrsMsg('404', '13327', { addMsg: err.parent.code });}

    if (!created) {
      [err, r] = await to(db.Users_WinListsHistory.update({
        win_bets: data.win_bets,
        win_rate: data.win_rate,
        matches_count: data.matches_count,
        correct_counts: data.correct_counts,
        fault_counts: data.fault_counts,
        spread_correct_counts: data.spread_correct_counts,
        totals_correct_counts: data.totals_correct_counts,
        spread_fault_counts: data.spread_fault_counts,
        totals_fault_counts: data.totals_fault_counts,
        spread_win_rate: data.spread_win_rate,
        totals_win_rate: data.totals_win_rate,
        spread_correct_bets: data.spread_correct_bets,
        totals_correct_bets: data.totals_correct_bets,
        spread_fault_bets: data.spread_fault_bets,
        totals_fault_bets: data.totals_fault_bets,
        spread_win_bets: data.spread_win_bets,
        totals_win_bets: data.totals_win_bets
      }, {
        where: {
          uid: data.uid,
          league_id: data.league_id,
          date_timestamp: begin,
          day_of_year: dayOfYear,
          period: period,
          week_of_period: weekOfPeriod,
          week: week,
          month: month,
          season: season
        }
      }));
      if (err) {console.error(err); throw errs.dbErrsMsg('404', '13330', { addMsg: err.parent.code });}
    }

    result.status['1'].lists.push({ uid: data.uid, league: data.league_id });
  };

  s22 = new Date().getTime();
  // c.
  // d.
  // 這星期、這個月、這賽季、本期大神
  // this_week、this_month、this_season、this_period

  for (const data of resultWinList) {
    const uid = data.uid;
    const league_id = data.league_id;
    const season = await getSeason(data.league_id);

    const allTotalCount = await winBetsRateTotalCount(uid, league_id,
      dayOfYear, week, month, season, period);

    // 檢查 是否有6筆資料
    // if (allTotalCount.length !== 6) return reject(errs.errsMsg('404', '13422')); // 筆數異常

    // 檢查是否為數字
    const ele = allTotalCount;

    const this_week_win_rate = num1RateSum(ele.sum_week.correct_counts, ele.sum_week.fault_counts);
    const this_month_win_rate = num1RateSum(ele.sum_month.correct_counts, ele.sum_month.fault_counts);
    const this_period_win_rate = num1RateSum(ele.sum_period.correct_counts, ele.sum_period.fault_counts);
    const this_week1_of_period_win_rate = num1RateSum(ele.sum_week1_of_period.correct_counts, ele.sum_week1_of_period.fault_counts);
    const this_season_win_rate = num1RateSum(ele.sum_season.correct_counts, ele.sum_season.fault_counts);

    if (isNotANumber(this_week_win_rate)) throw errs.errsMsg('404', '1323'); // 非數值
    if (isNotANumber(this_month_win_rate)) throw errs.errsMsg('404', '1323'); // 非數值
    if (isNotANumber(this_period_win_rate)) throw errs.errsMsg('404', '1323'); // 非數值
    if (isNotANumber(this_week1_of_period_win_rate)) throw errs.errsMsg('404', '1323'); // 非數值
    if (isNotANumber(this_season_win_rate)) throw errs.errsMsg('404', '1323'); // 非數值

    // c.
    // day_of_year 目前未使用
    // 回寫結果 到 users__win__lists
    let r = {}; let r2 = {};
    let err, winLists, created;

    try {
      [err, [winLists, created]] = await to(db.Users_WinLists.findOrCreate({
        where: {
          uid: data.uid,
          league_id: data.league_id
        },
        defaults: {
          uid: uid,
          league_id: league_id,
          this_week_win_rate: this_week_win_rate,
          this_week_win_bets: ele.sum_week.win_bets,
          this_week_correct_counts: ele.sum_week.correct_counts,
          this_week_fault_counts: ele.sum_week.fault_counts,
          this_month_win_rate: this_month_win_rate,
          this_month_win_bets: ele.sum_month.win_bets,
          this_month_correct_counts: ele.sum_month.correct_counts,
          this_month_fault_counts: ele.sum_month.fault_counts,
          this_period_win_rate: this_period_win_rate,
          this_period_win_bets: ele.sum_period.win_bets,
          this_period_correct_counts: ele.sum_period.correct_counts,
          this_period_fault_counts: ele.sum_period.fault_counts,
          this_week1_of_period_win_rate: this_week1_of_period_win_rate,
          this_week1_of_period_win_bets: ele.sum_week1_of_period.win_bets,
          this_week1_of_period_correct_counts: ele.sum_week1_of_period.correct_counts,
          this_week1_of_period_fault_counts: ele.sum_week1_of_period.fault_counts,
          this_season_win_rate: this_season_win_rate,
          this_season_win_bets: ele.sum_season.win_bets,
          this_season_correct_counts: ele.sum_season.correct_counts,
          this_season_fault_counts: ele.sum_season.fault_counts
        }
      }));
    } catch (e) {console.error(err); throw errs.dbErrsMsg('404', '13433', { addMsg: err.parent.code });}
    // if (err) {console.error(err); throw errs.dbErrsMsg('404', '13433', { addMsg: err.parent.code });}

    if (!created) {
      [err, r] = await to(db.Users_WinLists.update({
        this_week_win_rate: this_week_win_rate,
        this_week_win_bets: ele.sum_week.win_bets,
        this_week_correct_counts: ele.sum_week.correct_counts,
        this_week_fault_counts: ele.sum_week.fault_counts,
        this_month_win_rate: this_month_win_rate,
        this_month_win_bets: ele.sum_month.win_bets,
        this_month_correct_counts: ele.sum_month.correct_counts,
        this_month_fault_counts: ele.sum_month.fault_counts,
        this_period_win_rate: this_period_win_rate,
        this_period_win_bets: ele.sum_period.win_bets,
        this_period_correct_counts: ele.sum_period.correct_counts,
        this_period_fault_counts: ele.sum_period.fault_counts,
        this_week1_of_period_win_rate: this_week1_of_period_win_rate,
        this_week1_of_period_win_bets: ele.sum_week1_of_period.win_bets,
        this_week1_of_period_correct_counts: ele.sum_week1_of_period.correct_counts,
        this_week1_of_period_fault_counts: ele.sum_week1_of_period.fault_counts,
        this_season_win_rate: this_season_win_rate,
        this_season_win_bets: ele.sum_season.win_bets,
        this_season_correct_counts: ele.sum_season.correct_counts,
        this_season_fault_counts: ele.sum_season.fault_counts
      }, {
        where: {
          uid: data.uid,
          league_id: data.league_id
        }
      }));
      if (err) {console.error(err); throw errs.dbErrsMsg('404', '13436', { addMsg: err.parent.code });}
    }

    // if (r) return reject(errs.errsMsg('404', '13420')); // 更新筆數異常

    result.status['2'].lists.push({ uid: data.uid, league: data.league_id });

    s23 = new Date().getTime();
    // d.
    // 回寫 win_bets、win_rate 到 titles
    [err, r2] = await to(db.Title.update({
      win_bets: ele.sum_period.win_bets,
      win_rate: NP.round(NP.times(this_period_win_rate, 100), floatNumber)
    }, {
      where: {
        uid: uid,
        league_id: league_id,
        period: period
      }
    }));
    if (err) {console.error(err); throw errs.dbErrsMsg('404', '13539', { addMsg: err.parent.code });}

    // 有可能不是大神，無更新筆數
    // if (r[0] !== 1) return reject(errs.errsMsg('404', '13524')); // 更新筆數異常

    if (r2[0] === 1) result.status['3'].lists.push({ uid: uid, league: league_id, period: period });
  }

  const e = new Date().getTime();
  console.log(`${colors.bg.Blue}${colors.fg.Crimson}settleWinListModel 1# %o ms   2# %o ms   21# %o ms   22# %o ms   23# %o ms ${colors.Reset}`,
    s2 - s1, s21 - s2, s22 - s21, s23 - s22, e - s23);
  return result;
}

// 計算出 本周、本月、本期、本賽季 統計資料
// rang： day_of_year、week、month、season、period、week1_of_period
// sum(win_bets), sum(correct_counts), sum(fault_counts)
async function winBetsRateTotalCount(uid, league_id,
  day_of_year = 0, week = 0, month = 0, season = 0, period = 0, week_of_period = 1) {
  const needSumFileld = ['win_bets', 'correct_counts', 'fault_counts'];

  const uid_league_histories = await db.sequelize.query(`
    select *
      from users__win__lists__histories
     where uid = :uid
       and league_id = :league_id
       and season = :season
  `, {
    replacements: {
      uid: uid,
      league_id: league_id,
      season: season
    },
    // logging: console.log,
    type: db.sequelize.QueryTypes.SELECT
  });

  d('\n');
  d(`${colors.fg.Green} %o %o %o ${colors.Reset}`, uid, league_id, season);
  d(`${colors.fg.Magenta} day_of_year: %o  week: %o  period: %o  week_of_period: %o  month: %o${colors.Reset}`,
    day_of_year, week, period, week_of_period, month);

  return {
    sum_day_of_year: groupSum(uid_league_histories, { day_of_year: day_of_year }, needSumFileld),
    sum_week: groupSum(uid_league_histories, { week: week }, needSumFileld),
    sum_month: groupSum(uid_league_histories, { month: month }, needSumFileld),
    sum_period: groupSum(uid_league_histories, { period: period }, needSumFileld),
    sum_week1_of_period: groupSum(uid_league_histories, { week_of_period: week_of_period, period: period }, needSumFileld),
    sum_season: groupSum(uid_league_histories, { season: season }, needSumFileld)
  };
}

// 把 array 進行 group Sum 群組計算
// 過瀘條件 !! 記得把要sum的欄位放在第一個
// 範例：
//   filterField： {week1_of_period: 1, period: 115}
//   groupByField： ['win_bets', 'correct_counts', 'fault_counts']
// 回傳範例：
//   { period: { win_bets: -1.5, correct_counts: 0, fault_counts: 1 } }
//   { week_of_period: { win_bets: -1.5, correct_counts: 0, fault_counts: 1 } }
function groupSum(arr, filterField, groupByField) {
  // 先進行過瀘 // 例： {week1_of_period: 1, period: 115} 符合這個值的才往下處理
  const filtered_arr = arr.filter(function(item) {
    for (var key in filterField) {
      if (item[key] === undefined || item[key] !== filterField[key]) {return false;}
    }
    return true;
  });

  // 回傳欄位 只取第一個過瀘值，故要唯一值
  const sumName = Object.keys(filterField)[0]; // filterField key // 例：week_of_period
  const sumValue = Object.values(filterField)[0]; // filterField value // 例：1

  // 準備初始化格式 避免過瀘後沒有資料筆數產生 空{} 問題
  const initCounts = { [sumName]: {} }; // 例： { week_of_period: {} }
  groupByField.forEach((key) => { // 例：{ week_of_period: { win_bets: 0, correct_counts: 0, fault_counts: 0 } }
    initCounts[sumName][key] = 0;
  });
  if (filtered_arr.length === 0) return initCounts[sumName]; // 過瀘後沒有筆數的話，直接回傳 初始結構

  // 開始處理
  d('\n');
  d(`${colors.fg.Magenta} Filter: %o %o ${colors.Reset}`, sumName, sumValue);
  const counts = filtered_arr.reduce((p, c) => {
    if (!Object.prototype.hasOwnProperty.call(p, sumName)) { // 初始化欄位
      p = initCounts;
      // d(`${colors.fg.Green} %o %o ${colors.Reset}`, c.uid, c.league_id);
    }

    if (c[sumName] === sumValue) { // 進行累計
      d(`${colors.fg.Yellow}  %o uid_league_histories id ${colors.Reset}`, c.id);
      groupByField.forEach((key) => {
        p[sumName][key] = NP.plus(p[sumName][key], c[key]); // p[sumName][key] += c[key];
        d('    GroupBy: %o Sum: %o BeSum: %o', key, p[sumName][key], c[key]);
      });
    }

    return p;
  }, {});
  return counts[sumName];
  // const countsExtended = Object.keys(counts).map(k => {
  //   return {name: k, count: counts[k]}; });
}

function num1RateSum(num1, num2, f = 2) {
  // console.log('num1RateSum: %o / %o', Number(num1), (Number(num1) + Number(num2)));
  NP.enableBoundaryChecking(false);
  return isNotANumber(num1) || isNotANumber(num2) || NP.plus(num1, num2) === 0 // 不是數字 且 避免分母是0
    ? 0
    : NP.round(NP.divide(num1, NP.plus(num1, num2)), f);
}

// https://1loc.dev/
const toNumber = str => +str;
const isNumber = value => !isNaN(parseFloat(value)) && isFinite(value);
const isNotANumber = value => !isNumber(value);

const colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',
  fg: {
    Black: '\x1b[30m',
    Red: '\x1b[31m',
    Green: '\x1b[32m',
    Yellow: '\x1b[33m',
    Blue: '\x1b[34m',
    Magenta: '\x1b[35m',
    Cyan: '\x1b[36m',
    White: '\x1b[37m',
    Crimson: '\x1b[38m'
  },
  bg: {
    Black: '\x1b[40m',
    Red: '\x1b[41m',
    Green: '\x1b[42m',
    Yellow: '\x1b[43m',
    Blue: '\x1b[44m',
    Magenta: '\x1b[45m',
    Cyan: '\x1b[46m',
    White: '\x1b[47m',
    Crimson: '\x1b[48m'
  }
};

module.exports = settleWinList;
