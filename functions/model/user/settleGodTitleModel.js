const {
  convertDateYMDToGTM0Unix, moment, groupsByOrdersLimit, mergeDeep, fieldSorter, NP
} = require('../../util/modules');
const { checkUserRight } = require('../../util/databaseEngine');

const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;
const floatNumber = 4;

const isEmulator = process.env.FUNCTIONS_EMULATOR;
const logger = require('firebase-functions/lib/logger');
// const d = require('debug')('user:settleGodTitleModel'); // firebase 升級後廢掉了
const util = require('util');
function d(...args) {
  if (typeof (console) !== 'undefined') {
    isEmulator
      ? console.log(util.format(...args))
      : logger.log('[user settleGodTitleModel]', util.format(...args));
  }
}

async function settleGodTitle(args) {
  // return new Promise(async function(resolve, reject) {
  // 1. 管理者才能進行 API 呼叫
  // 2. 抓取近三十天資料 是 這期大神的使用者才需要計算
  //   a. 使用 users__win__lists_histories
  //   b. 使用 users_predictions
  // 2.1. 連贏Ｎ天
  // 2.2. 勝注連過 Ｎ日
  // 2.3. 近 Ｎ日 Ｎ過 Ｎ 和 近 Ｎ日 過 Ｎ
  // 2.4. 近 Ｎ 場過 Ｎ 場
  // 2.5. 連贏Ｎ場

  // 產生 30 天測試用資料
  // start = convertDateYMDToGTM0Unix(moment().utcOffset(8).format('YYYY-MM-DD'));
  // console.log('start: %o  %o', moment().utcOffset(8).format('YYYY-MM-DD'), start)

  // for(i=1; i<=30; i++){
  //   subtract = convertDateYMDToGTM0Unix(moment().utcOffset(8).format('YYYY-MM-DD'),
  //     { op: 'subtract', value: i, unit: 'days' }) * 1000;

  //   const period = modules.getTitlesNexteriod(subtract).period;
  //   const dayOfYear = moment(subtract).format('DDD'); // 日期是 一年中的第幾天
  //   const week = moment(subtract).week();
  //   const momentObject = moment(subtract).toObject();
  //   const month = momentObject.months + 1;
  //   const season = momentObject.years;

  //   console.log('subtract %o: %o  %o period: %o  dayOfYear: %o  week: %o  month: %o  season: %o',
  //     i, moment(subtract).utcOffset(8).format('YYYY-MM-DD'), subtract/1000,
  //     period, dayOfYear, week, month, season)
  // }
  //= ==============

  const userUid = args.token.uid;
  const period = args.period;
  const days = 30;

  // 近 30 天
  const nowYYYYMMDD = moment().utcOffset(8).format('YYYY-MM-DD');
  const end_30days = convertDateYMDToGTM0Unix(nowYYYYMMDD);
  const begin_30days = convertDateYMDToGTM0Unix(nowYYYYMMDD, { num: -days }) - 1;

  const result = {
    status: {
      1: {
        msg: '大神 稱號資料更新成功！',
        lists: []
      }
    }
  };

  const s1 = new Date().getTime();
  // 1.
  // !!!! 記得改成 9
  const checkResult = await checkUserRight(userUid, [1, 2, 9], '130820');
  if (checkResult.code) throw checkResult;

  let s20 = 0;
  let s2_123 = 0;
  let s21 = 0;
  let s2_45 = 0;
  let s3_u = 0;
  let mixAll = {};

  // 2.
  s20 = new Date().getTime();
  //
  // a. 使用 users__win__lists_histories
  //
  // 這期大神 抓 30 日 資料
  const usersWinListsHistories = await db.sequelize.query(`
        select *
          from users__win__lists__histories history, 
               (
                 select uid, league_id
                   from titles
                  where period = :period
               ) title_user
         where history.uid = title_user.uid
           and history.league_id = title_user.league_id
           and history.date_timestamp between :begin and :end
      `, {
    replacements: {
      period: period,
      begin: begin_30days,
      end: end_30days
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  let reformatHistory = []; // 依 uid league_id 為一個組，並 照 date_timestamp 排序過

  reformatHistory = groupsByOrdersLimit(usersWinListsHistories, ['uid', 'league_id'], ['-date_timestamp']);

  // 依 使用者-聯盟 進行 稱號判斷

  s2_123 = new Date().getTime();
  d('%s', '2.1 2.2 2.3'); // ${colors.fg.Red} ${colors.Reset}
  reformatHistory.forEach(function(uid_league_data) {
    d('\n');
    d('uid: %o   league_id: %o \n', uid_league_data.uid, uid_league_data.league_id); // ${colors.fg.Green} ${colors.Reset}

    //
    // 2.1. 連贏Ｎ天 continue
    //
    d('\n');
    d('%s', '  2.1. 連贏Ｎ天 continue'); // ${colors.fg.Yellow} ${colors.Reset}
    const winContinueN = continueN(uid_league_data);

    //
    // 2.2. 勝注連過 Ｎ日 win_bets_continue
    //
    d('\n');
    d('%s', '  2.2. 勝注連過 Ｎ日 win_bets_continue'); // ${colors.fg.Yellow} ${colors.Reset}
    const winBetsContinueN = winBetsContinue(uid_league_data);

    //
    // 2.3. 近 Ｎ日 Ｎ過 Ｎ 和 近 Ｎ日 過 Ｎ  predict_rate1, predict_rate2, predict_rate3  >= 第五場
    // acc 累計
    //
    d('\n');
    d('%s', '  2.3. 近 Ｎ日 Ｎ過 Ｎ 和 近 Ｎ日 過 Ｎ  predict_rate1, predict_rate2, predict_rate3  >= 第五場'); // ${colors.fg.Yellow} ${colors.Reset}
    const { predictRateN1, predictRateN2, predictRateN3 } = nnPassN(uid_league_data);

    //
    // 將結果合併到 mixAll  依uid、league_id、 整個戰績名稱
    //
    d('\n');
    d('continue: %o  win_bets_continue: %o ', winContinueN, winBetsContinueN); // ${colors.fg.Magenta} ${colors.Reset}
    d('predict_rate NNN NN: %o  %o  %o \n', predictRateN1, predictRateN2, predictRateN3); // ${colors.fg.Magenta} ${colors.Reset}

    mixAll = mergeDeep(mixAll, {
      [uid_league_data.uid]: {
        [uid_league_data.league_id]: {
          continue: winContinueN,
          win_bets_continue: winBetsContinueN,
          predict_rate1: predictRateN1,
          predict_rate2: predictRateN2,
          predict_rate3: predictRateN3
        }
      }
    });
  });

  s21 = new Date().getTime();
  //
  // b. 使用 users_predictions
  //
  const usersPrediction = await db.sequelize.query(`
        select *
          from user__predictions prediction, 
               (
                 select uid, league_id
                   from titles
                  where period = :period
               ) title_user
         where prediction.uid = title_user.uid
           and prediction.league_id = title_user.league_id
           and prediction.match_scheduled between :begin and :end
           and (
                   (spread_result_flag != -2 and spread_result_flag != 0)
                 or 
                   (totals_result_flag != -2 or totals_result_flag != 0)
               )
      `, {
    replacements: {
      period: period,
      begin: begin_30days,
      end: end_30days
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  let reformatPrediction = []; // 依 uid league_id 為一個組，並 照 match_scheduled 排序過
  reformatPrediction = groupsByOrdersLimit(usersPrediction, ['uid', 'league_id'], ['-match_scheduled']);

  s2_45 = new Date().getTime();
  d('%s', '### 2.4 2.5'); // ${colors.fg.Red} ${colors.Reset}
  reformatPrediction.forEach(function(uid_league_data) {
    d('\n');
    d('uid: %o   league_id: %o \n', uid_league_data.uid, uid_league_data.league_id); // ${colors.fg.Green} ${colors.Reset}
    //
    // 2.4. 近 Ｎ 場過 Ｎ 場  matches_rate1, matches_rate2  >= 第五場
    // acc 累計
    //
    d('\n');
    d('%s', '  2.4. 近 Ｎ 場過 Ｎ 場  matches_rate1, matches_rate2  >= 第五場'); // ${colors.fg.Yellow} ${colors.Reset}
    const { matchesRateN1, matchesRateN2 } = matchesRate(uid_league_data);

    //
    // 2.5. 連贏Ｎ場 matches_continue
    //
    d('\n');
    d('%s', '  2.5. 連贏Ｎ場 matches_continue'); // ${colors.fg.Yellow} ${colors.Reset}
    const matchesContinueN = matchesContinue(uid_league_data);

    //
    // 將結果合併到 mixAll  依uid、league_id、 整個戰績名稱
    //
    d('\n');
    d('matches_rate: %o  %o', matchesRateN1, matchesRateN2); // ${colors.fg.Magenta} ${colors.Reset}
    d('matches_continue: %o \n', matchesContinueN); // ${colors.fg.Magenta} ${colors.Reset}

    mixAll = mergeDeep(mixAll, {
      [uid_league_data.uid]: {
        [uid_league_data.league_id]: {
          matches_rate1: matchesRateN1,
          matches_rate2: matchesRateN2,
          matches_continue: matchesContinueN
        }
      }
    });
  });

  s3_u = new Date().getTime();
  d('%s', '### update titles \n'); // ${colors.fg.Red} ${colors.Reset}
  // 把 所有計算出來的資料寫入 Title
  for (const [uid, value] of Object.entries(mixAll)) {
    d('uid: %o ', uid); // ${colors.fg.Green} ${colors.Reset}
    for (const [league_id, value2] of Object.entries(value)) {
      d('league_id: %o ', league_id); // ${colors.fg.Green} ${colors.Reset}
      d('value2: %O \n', value2);
      const [err, r] = await to(db.Title.update({
        continue: value2.continue,
        win_bets_continue: value2.win_bets_continue,
        predict_rate1: value2.predict_rate1,
        predict_rate2: value2.predict_rate2,
        predict_rate3: value2.predict_rate3,
        matches_rate1: value2.matches_rate1,
        matches_rate2: value2.matches_rate2,
        matches_continue: value2.matches_continue
      }, {
        where: {
          uid: uid,
          league_id: league_id,
          period: period
        }
      }));
      if (err) {
        logger.warn('[Error][settleGodTitleModel][Title] ', err);
        throw errs.dbErrsMsg('404', '13503', { addMsg: err.parent.code });
      }
      if (r[0] === 1) result.status['1'].lists.push({ uid: uid, league: league_id, period: period });
    };
  };

  const e = new Date().getTime();
  console.log(`${colors.bg.Blue}${colors.fg.Crimson}settleGodTitleModel 1# %o ms   20# %o ms   2_123# %o ms   21# %o ms   2_45# %o ms  3_u# %o ms ${colors.Reset}`,
    s20 - s1, s2_123 - s20, s21 - s2_123, s2_45 - s21, s3_u - s2_45, e - s3_u);
  return result;
  // });
}

const isNumber = value => !isNaN(parseFloat(value)) && isFinite(value);
const isNotANumber = value => !isNumber(value);

function num1RateSum(num1, num2, f = 2) {
  // console.log('numberRate: %o / %o', Number(num1), Number(num2));
  NP.enableBoundaryChecking(false);
  return isNotANumber(num1) || isNotANumber(num2) || num2 === 0
    ? 0
    : NP.round(NP.divide(num1, num2), f);
}

// 連贏Ｎ天
function continueN(uid_league_data) {
  let winContinueN = 0;
  uid_league_data.lists.every(function(lists, index) {
    // console.log('uid: %o  league_id: %o  %o', uid_league_data.uid, uid_league_data.league_id, lists);
    d('  %o lists.correct_counts: %o  lists.fault_counts: %o   - : %o',
      index, lists.correct_counts, lists.fault_counts, lists.correct_counts - lists.fault_counts);
    winContinueN = (lists.correct_counts - lists.fault_counts) > 0 ? index + 1 : index;
    return (lists.correct_counts - lists.fault_counts) > 0; // 代表過盤
  });
  return winContinueN;
}

// 勝注連過 Ｎ日
function winBetsContinue(uid_league_data) {
  let winBetsContinueN = 0;
  uid_league_data.lists.every(function(lists, index) {
    d('  %o lists.win_bets: %o ', index, lists.win_bets);
    winBetsContinueN = (lists.win_bets > 0) ? index + 1 : index;
    return lists.win_bets > 0; // 代表過盤
  });
  return winBetsContinueN;
}

// 近 Ｎ日 Ｎ過 Ｎ 和 近 Ｎ日 過 Ｎ
// acc 累計
function nnPassN(uid_league_data) {
  let predictRateN1 = 0; let predictRateN2 = 0; let predictRateN3 = 0;
  const allRecords = []; // 記錄所有資料

  uid_league_data.lists.forEach(function(lists, index) {
    const item = {};
    item.days = index + 1;

    if (index === 0) { // 第一筆 直接計算
      item.totalsCountAcc = (lists.correct_counts + lists.fault_counts);
      item.correctCountsAcc = lists.correct_counts;
    } else { // 第二筆之後 要累計
      item.totalsCountAcc = allRecords[index - 1].totalsCountAcc + (lists.correct_counts + lists.fault_counts);
      item.correctCountsAcc = allRecords[index - 1].correctCountsAcc + lists.correct_counts;
    }

    item.winRateAcc = (item.totalsCountAcc === 0)
      ? 0
      : NP.times(num1RateSum(item.correctCountsAcc, item.totalsCountAcc, floatNumber), 100); // 勝率

    allRecords.push(item);
  });

  if (d.enabled) {
    allRecords.forEach(function(r) {
      d('  days: %o totalsCountAcc: %o correctCountsAcc: %o winRateAcc: %o',
        r.days, r.totalsCountAcc, r.correctCountsAcc, r.winRateAcc);
    });
  }

  // !! 不知道為何沒有 sort 後沒有 stable，理論上 v8 2019年後已支援 sort stable
  // 所以 當勝率相同時，以 days 大 -> 小
  // allRecords.sort(function compare(a, b) {
  //   return b.winRateAcc - a.winRateAcc === 0 ? b.days - a.days : b.winRateAcc - a.winRateAcc; // 降 大->小
  // });
  allRecords.sort(fieldSorter(['-winRateAcc', '-days']));

  // 要至少計算五場，選擇機率最高者 >= 5場
  // if (allRecords.length >= 5 && allRecords[0].days >= 5) {
  //   // console.log(allRecords[0])
  //   predictRateN1 = allRecords[0].days;
  //   predictRateN2 = allRecords[0].totalsCountAcc;
  //   predictRateN3 = allRecords[0].correctCountsAcc;
  // };
  allRecords.every(function(ele) {
    if (allRecords.length >= 5 && ele.days >= 5) {
      // console.log(allRecords[0])
      predictRateN1 = ele.days;
      predictRateN2 = ele.totalsCountAcc;
      predictRateN3 = ele.correctCountsAcc;
      return false;
    };
    return true;
  });

  return { predictRateN1, predictRateN2, predictRateN3 };
}

// 近 Ｎ 場過 Ｎ 場
function matchesRate(uid_league_data) {
  let matchesRateN1 = 0; let matchesRateN2 = 0;
  const allRecords = []; // 記錄所有資料
  let n = 0; // 這裡場次算是過盤

  uid_league_data.lists.forEach(function(lists) {
    // 讓分
    const r = nPassN(n, allRecords, lists.spread_result_flag);
    n = r.n;
    allRecords.push(r.item);

    // 大小
    const r2 = nPassN(n, allRecords, lists.totals_result_flag);
    n = r2.n;
    allRecords.push(r2.item);
  });

  if (d.enabled) {
    allRecords.forEach(function(r) {
      d('  days: %o totalsCountAcc: %o correctCountsAcc: %o winRateAcc: %o',
        r.days, r.totalsCountAcc, r.correctCountsAcc, r.winRateAcc);
    });
  }

  allRecords.sort(fieldSorter(['-winRateAcc']));

  // 要至少計算五場，選擇機率最高者 >= 5場 才給值
  if (allRecords.length >= 5 && allRecords[0].days >= 5) {
    // console.log(allRecords[0])
    matchesRateN1 = allRecords[0].days;
    matchesRateN2 = allRecords[0].correctCountsAcc;
  };

  return { matchesRateN1, matchesRateN2 };
}

// 近 Ｎ 場過 Ｎ 場 計算專用的
// 回傳 場數, (總場累計, 過盤場累計, 總勝率   場數)
function nPassN(n, allRecords, result_flag) {
  const item = {};
  let preTotalsCountAcc = 0;
  let preCorrectCountsAcc = 0;

  if (n !== 0) { // 不是第一筆時，取得之前的累計值
    preTotalsCountAcc = allRecords[n - 1].totalsCountAcc;
    preCorrectCountsAcc = allRecords[n - 1].correctCountsAcc;
  }

  const totalsCount = (result_flag !== -2 && result_flag !== 0) ? 1 : 0;
  item.totalsCountAcc = preTotalsCountAcc + totalsCount;

  const correctCount = (result_flag > 0) ? 1 : 0;
  item.correctCountsAcc = preCorrectCountsAcc + correctCount;
  item.winRateAcc = (item.totalsCountAcc === 0)
    ? 0
    : NP.times(num1RateSum(item.correctCountsAcc, item.totalsCountAcc, floatNumber), 100); // 勝率 * 100

  n++;
  item.days = n;
  return { n: n, item: item };
}

// 連贏Ｎ場
function matchesContinue(uid_league_data) {
  let matches_continue = 0;
  const allRecords2 = []; // 記錄所有資料
  let nn = 0; // 這裡場次算是過盤

  uid_league_data.lists.forEach(function(lists) {
    // 讓分
    const r = passN(nn, lists.spread_result_flag, lists.match_scheduled);
    nn = r.n;
    allRecords2.push(r.item);

    // 大小
    const r2 = passN(nn, lists.totals_result_flag, lists.match_scheduled);
    nn = r2.n;
    allRecords2.push(r2.item);
  });

  // 把 allRecords2  裡面的讓分、大小 照開下面條件排序
  // 開賽時間 大->小  過盤 大(過盤 1) -> 小(不過盤 0, -1)
  allRecords2.sort(fieldSorter(['-match_scheduled', '-correctMark']));

  if (d.enabled) {
    allRecords2.forEach(function(r2) {
      d('  days: %o match_scheduled: %o correctMark: %o',
        r2.days, r2.match_scheduled, r2.correctMark);
    });
  }

  allRecords2.every(function(data, index) {
    matches_continue = index;
    return data.correctMark !== 0 && data.correctMark !== -1; // 代表過盤
  });

  return matches_continue;
}

// 連贏Ｎ場 計算專用的
// 回傳 場數, (場數, 過盤註記, 開賽時間)
function passN(n, result_flag, match_scheduled) {
  const item = {};

  n++;
  item.days = n;
  item.match_scheduled = match_scheduled;
  item.correctMark = (result_flag !== -2 || result_flag === 0)
    ? 0
    : (result_flag > 0)
      ? 1
      : -1;

  return { n: n, item: item };
}

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

// https://stackoverflow.com/a/1215401
// const DEBUG = true;
// const old_console_log = console.log;
// console.log = function() {
//   if (DEBUG) {
//     old_console_log.apply(this, arguments);
//   }
// };

// 底下功能無效，提供 Debug 範例參考
// 當要判斷細部計算是否正確，可以打開此 Debug 模式，顯示更清楚計算細節
// const isProgramDebug = true;
// const pdLog = function() {
//   if (isProgramDebug) {
//     console.log.apply(this, arguments);
//   }
// };

module.exports = settleGodTitle;
