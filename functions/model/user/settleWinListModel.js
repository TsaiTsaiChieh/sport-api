const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

// 當要判斷細部計算是否正確，可以打開此 pdLog 模式，顯示更清楚計算細節
const isProgramDebug = false;
const pdLog = function() {
  if (isProgramDebug) {
    console.log.apply(this, arguments);
  }
};

function settleWinList(args) {
  return new Promise(async function(resolve, reject) {
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

    // !!!! 賽季需要討論 跨年賽季怎麼辨？

    // 勝率的計算比較特別，需要 總勝數(勝數+敗數) 和 勝數

    const userUid = args.token.uid;
    const begin = modules.convertTimezone(args.date);
    const end = modules.convertTimezone(args.date, { op: 'add', value: 1, unit: 'days' }) - 1;
    const tp = modules.getTitlesPeriod(begin * 1000);
    const period = tp.period;
    const weekOfPeriod = tp.weekPeriod;
    const dayOfYear = modules.moment(begin * 1000).format('DDD'); // 日期是 一年中的第幾天
    const week = modules.moment(begin * 1000).week();
    const momentObject = modules.moment(begin * 1000).toObject();
    const month = momentObject.months + 1;

    // !!!! 這個有可能產生跨年賽季問題
    const season = momentObject.years;

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
    try {
      const memberInfo = await db.User.findOne({ where: { uid: userUid } });

      if (memberInfo === null) {
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1301')); // ${userUid}
      }

      // !!!! 記得改成 9
      if (!([1, 2].includes(memberInfo.status))) { // 不是 管理者
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1308'));
      }

      // 改用 modules.userStatusCodebook 這支程式建議 要寫死，不要有 Default 值，因為一般使用者也有一堆權限
      // console.log('memberInfo status of statusSwitch: %o', modules.userStatusCodebook(memberInfo.status));
    } catch (err) {
      console.error('Error 1. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const s2 = new Date().getTime();
    let s21 = 0;
    let s22 = 0;
    let s23 = 0;
    // 3.
    try {
      // a.
      // 注意 !!!  正式有資料後，要把 今日日期區間判斷 打開來
      const predictMatchInfo = await db.sequelize.query(`
        select prediction.id, prediction.uid, prediction.league_id,
               spread_bets, totals_bets,
               spread_result_flag, totals_result_flag
          from user__predictions prediction, matches
         where prediction.bets_id = matches.bets_id
           -- and prediction.match_scheduled between :begin and :end
           and matches.flag_prematch = 1
           and matches.status = 0
           and (spread_result_flag != -2 or totals_result_flag != -2)
      `, {
        replacements: {
          begin: begin,
          end: end
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      const resultWinList = modules.predictionsWinList(predictMatchInfo);
      // console.log('resultWinList: ', resultWinList);

      s21 = new Date().getTime();
      // b.
      // 回寫結果 到 users_win_lists_history 記錄 該日 的 勝率、勝注 並 加上其他值 供以後查詢使用
      // !!!! season_year 取得從 league_id leagueCodeBook 取得
      try {
        const upsertResult = resultWinList.map(async function(data) {
          const r = await db.Users_WinListsHistory.upsert({
            uid: data.uid,
            league_id: data.league_id,
            win_bets: data.win_bets,
            win_rate: data.win_rate,
            matches_count: data.matches_count,
            correct_counts: data.correct_counts,
            fault_counts: data.fault_counts,
            date_timestamp: begin,
            day_of_year: dayOfYear,
            period: period,
            week_of_period: weekOfPeriod,
            week: week,
            month: month,
            season: season
          },
          {
            fields: ['win_bets', 'win_rate', 'matches_count', 'correct_counts', 'fault_counts']
          });

          result.status['1'].lists.push({ uid: data.uid, league: data.league_id });
        });

        await Promise.all(upsertResult);
      } catch (err) {
        console.error(err);
        return reject(errs.errsMsg('404', '1317'));
      }

      s22 = new Date().getTime();
      // c.
      // d.
      // 這星期、這個月、這賽季、本期大神
      // this_week、this_month、this_season、this_period
      try {
        const updateResult = resultWinList.map(async function(data) {
          const uid = data.uid;
          const league_id = data.league_id;

          const allTotalCount = await winBetsRateTotalCount(uid, league_id,
            dayOfYear, week, month, season, period);

          // 檢查 是否有6筆資料
          // if (allTotalCount.length !== 6) return reject(errs.errsMsg('404', '1322')); // 筆數異常

          // 檢查是否為數字
          const ele = allTotalCount;

          const this_week_win_rate = numberCount(ele.sum_week.correct_counts, ele.sum_week.fault_counts);
          const this_month_win_rate = numberCount(ele.sum_month.correct_counts, ele.sum_month.fault_counts);
          const this_period_win_rate = numberCount(ele.sum_period.correct_counts, ele.sum_period.fault_counts);
          const this_week1_of_period_win_rate = numberCount(ele.sum_week1_of_period.correct_counts, ele.sum_week1_of_period.fault_counts);
          const this_season_win_rate = numberCount(ele.sum_season.correct_counts, ele.sum_season.fault_counts);

          if (isNotANumber(this_week_win_rate)) return reject(errs.errsMsg('404', '1323')); // 非數值
          if (isNotANumber(this_month_win_rate)) return reject(errs.errsMsg('404', '1323')); // 非數值
          if (isNotANumber(this_period_win_rate)) return reject(errs.errsMsg('404', '1323')); // 非數值
          if (isNotANumber(this_week1_of_period_win_rate)) return reject(errs.errsMsg('404', '1323')); // 非數值
          if (isNotANumber(this_season_win_rate)) return reject(errs.errsMsg('404', '1323')); // 非數值

          // c.
          // day_of_year 目前未使用
          // 回寫結果 到 users__win__lists
          try {
            const r = await db.Users_WinLists.upsert({
              uid: uid,
              league_id: league_id,
              this_week_win_rate: this_week_win_rate,
              this_week_win_bets: ele.sum_week.win_bets,
              this_month_win_rate: this_month_win_rate,
              this_month_win_bets: ele.sum_month.win_bets,
              this_period_win_rate: this_period_win_rate,
              this_period_win_bets: ele.sum_period.win_bets,
              this_week1_of_period_win_rate: this_week1_of_period_win_rate,
              this_week1_of_period_win_bets: ele.sum_week1_of_period.win_bets,
              this_season_win_rate: this_season_win_rate,
              this_season_win_bets: ele.sum_season.win_bets
            }, {
              fields: [
                'this_week_win_rate', 'this_week_win_bets',
                'this_month_win_rate', 'this_month_win_bets',
                'this_period_win_rate', 'this_period_win_bets',
                'this_week1_of_period_win_rate', 'this_week1_of_period_win_bets',
                'this_season_win_rate', 'this_season_win_bets'
              ]
            });

            if (r) return reject(errs.errsMsg('404', '1320')); // 更新筆數異常

            result.status['2'].lists.push({ uid: data.uid, league: data.league_id });
          } catch (err) {
            console.error(err);
            return reject(errs.errsMsg('404', '1321'));
          }

          s23 = new Date().getTime();
          // d.
          // 回寫 win_bets、win_rate 到 titles
          try {
            const r = await db.Title.update({
              win_bets: ele.sum_period.win_bets,
              win_rate: this_period_win_rate
            }, {
              where: {
                uid: uid,
                league_id: league_id,
                period: period
              }
            });

            // 有可能不是大神，無更新筆數
            // if (r[0] !== 1) return reject(errs.errsMsg('404', '1324')); // 更新筆數異常

            if (r[0] === 1) result.status['3'].lists.push({ uid: uid, league: league_id, period: period });
          } catch (err) {
            console.error(err);
            return reject(errs.errsMsg('404', '1321'));
          }
        });

        await Promise.all(updateResult);
      } catch (err) {
        console.error(err);
        return reject(errs.errsMsg('404', '1319'));
      }
    } catch (err) {
      console.error('Error 3. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const e = new Date().getTime();
    console.log('\n settleWinListModel 1# %o ms   2# %o ms   21# %o ms   22# %o ms   23# %o ms',
      s2 - s1, s21 - s2, s22 - s21, s23 - s22, e - s23);
    return resolve(result);
  });
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

  return {
    sum_day_of_year: groupSum(uid_league_histories, { day_of_year: day_of_year }, needSumFileld).day_of_year,
    sum_week: groupSum(uid_league_histories, { week: week }, needSumFileld).week,
    sum_month: groupSum(uid_league_histories, { month: month }, needSumFileld).month,
    sum_period: groupSum(uid_league_histories, { period: period }, needSumFileld).period,
    sum_week1_of_period: groupSum(uid_league_histories, { week_of_period: week_of_period, period: period }, needSumFileld).week_of_period,
    sum_season: groupSum(uid_league_histories, { season: season }, needSumFileld).season
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
  // 先進行過瀘
  const filtered_arr = arr.filter(function(item) {
    for (var key in filterField) {
      if (item[key] === undefined || item[key] !== filterField[key]) {return false;}
    }
    return true;
  });

  // 回傳欄位 只取第一個過瀘值，故要唯一值
  const name = Object.keys(filterField)[0]; // filterField key
  const value = Object.values(filterField)[0]; // filterField value

  // 準備初始化格式 避免過瀘後沒有資料筆數產生 空{} 問題
  const initCounts = { [name]: {} };
  groupByField.forEach((key) => {
    initCounts[name][key] = 0;
  });
  if (filtered_arr.length === 0) return initCounts;

  pdLog('\nFilter: %o %o', name, value);
  const counts = filtered_arr.reduce((p, c) => {
    if (!Object.prototype.hasOwnProperty.call(p, name)) { // 初始化欄位
      p = initCounts;
      pdLog(' %o %o', c.uid, c.league_id);
    }

    if (c[name] === value) { // 進行累計
      pdLog('\n  %o uid_league_histories id', c.id);
      groupByField.forEach((key) => {
        p[name][key] += c[key];
        pdLog('    GroupBy: %o Sum: %o BeSum: %o', key, p[name][key], c[key]);
      });
    }

    return p;
  }, {});

  return counts;
  // const countsExtended = Object.keys(counts).map(k => {
  //   return {name: k, count: counts[k]}; });
}

function numberCount(num1, num2, f = 2) {
  // console.log('numberCount: %o / %o', Number(num1), ( Number(num1) + Number(num2)));
  return isNotANumber(num1) || isNotANumber(num2) || (Number(num1) + Number(num2)) === 0 // 不是數字 且 避免分母是0
    ? 0
    : Number(
      Number(num1) / (Number(num1) + Number(num2))
    ).toFixed(f);
}

function isNotANumber(inputData) {
  // isNaN(inputData)不能判斷空串或一個空格
  // 如果是一個空串或是一個空格，而isNaN是做為數字0進行處理的，
  // 而parseInt與parseFloat是返回一個錯誤訊息，這個isNaN檢查不嚴密而導致的。
  if (parseFloat(inputData).toString() === 'NaN') {
    // alert(“請輸入數字……”);
    return true;
  } else {
    return false;
  }
}

module.exports = settleWinList;
