const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

// 當要判斷細部計算是否正確，可以打開此 pdLog 模式，顯示更清楚計算細節
const isProgramDebug = true;
const pdLog = function() {
  if (isProgramDebug) {
    console.log.apply(this, arguments);
  }
};

function settleGodTitle(args) {
  return new Promise(async function(resolve, reject) {
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
    // start = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'));
    // console.log('start: %o  %o', modules.moment().utcOffset(8).format('YYYY-MM-DD'), start)

    // for(i=1; i<=30; i++){
    //   subtract = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'),
    //     { op: 'subtract', value: i, unit: 'days' }) * 1000;

    //   const period = modules.getTitlesPeriod(subtract).period;
    //   const dayOfYear = modules.moment(subtract).format('DDD'); // 日期是 一年中的第幾天
    //   const week = modules.moment(subtract).week();
    //   const momentObject = modules.moment(subtract).toObject();
    //   const month = momentObject.months + 1;
    //   const season = momentObject.years;

    //   console.log('subtract %o: %o  %o period: %o  dayOfYear: %o  week: %o  month: %o  season: %o',
    //     i, modules.moment(subtract).utcOffset(8).format('YYYY-MM-DD'), subtract/1000,
    //     period, dayOfYear, week, month, season)
    // }
    //= ==============

    const userUid = args.token.uid;
    const period = args.period;
    const days = 30;

    // 近 30 天
    const end_30days = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'));
    const begin_30days = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'),
      { op: 'subtract', value: days, unit: 'days' }) - 1;

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
      console.log('memberInfo status of statusSwitch: %o', modules.userStatusCodebook(memberInfo.status));
    } catch (err) {
      console.error('Error 1. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const s2 = new Date().getTime();
    let s21 = 0;
    let s22 = 0;
    let s23 = 0;
    let s24 = 0;
    let mixAll = {};

    // 2.
    try {
      s21 = new Date().getTime();
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

      reformatHistory = modules.groupsByOrderLimit(usersWinListsHistories, ['uid', 'league_id']
        , ['-date_timestamp']);
      // const uidHistory = modules.groupBy(usersWinListsHistories, 'uid');

      // // uidHistory.map(function(data) {
      // for (const data of uidHistory) {
      //   const uidLeagueHistory = modules.groupBy(data, 'league_id');

      //   uidLeagueHistory.forEach(function(data2) {
      //     data2.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
      //       // console.log('a. %o  b. %o  %o', a.date_timestamp, b.date_timestamp, a.date_timestamp - b.date_timestamp)
      //       return b.date_timestamp - a.date_timestamp; // 降 大->小
      //     });

      //     reformatHistory.push({ uid: data2[0].uid, league_id: data2[0].league_id, lists: data2.slice(0, days) });
      //   });
      // };
      // // });

      // 依 使用者-聯盟 進行 稱號判斷
      // console.log('usersWinListsHistories: ', usersWinListsHistories);
      // console.log('uidHistory: ', uidHistory);
      // console.log('uidLeagueUidHistory: ', uidLeagueUidHistory);

      s22 = new Date().getTime();
      pdLog('\n2.1 2.2 2.3');
      reformatHistory.forEach(function(uid_league_data) {
        pdLog('\nuid: %o   league_id: %o', uid_league_data.uid, uid_league_data.league_id);

        //
        // 2.1. 連贏Ｎ天 countinue
        //
        let countinue = 0;
        uid_league_data.lists.every(function(lists, index) {
          // console.log('uid: %o  league_id: %o  %o', uid_league_data.uid, uid_league_data.league_id, lists);
          countinue = index;
          return ((lists.correct_counts - lists.fault_counts) > 0); // 代表過盤
        });

        //
        // 2.2. 勝注連過 Ｎ日 win_bets_continue
        //
        let win_bets_continue = 0;
        uid_league_data.lists.every(function(lists, index) {
          win_bets_continue = index;
          return (lists.win_bets > 0); // 代表過盤
        });

        //
        // 2.3. 近 Ｎ日 Ｎ過 Ｎ 和 近 Ｎ日 過 Ｎ  predict_rate1, predict_rate2, predict_rate3
        // acc 累計
        //
        let predict_rate1 = 0; let predict_rate2 = 0; let predict_rate3 = 0;
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
            : numberRate(item.correctCountsAcc, item.totalsCountAcc) * 100; // 勝率 * 100

          allRecords.push(item);
        });

        allRecords.sort(function compare(a, b) {
          return b.winRateAcc - a.winRateAcc; // 降 大->小
        });

        // 要至少計算五場，選擇機率最高者 >= 5場
        if (allRecords.length >= 5 && allRecords[0].days >= 5) {
          // console.log(allRecords[0])
          predict_rate1 = allRecords[0].days;
          predict_rate2 = allRecords[0].totalsCountAcc;
          predict_rate3 = allRecords[0].correctCountsAcc;
        };

        //
        // 將結果合併到 mixAll  依uid、league_id、 整個戰績名稱
        //
        pdLog('countinue: %o  win_bets_continue: %o', countinue, win_bets_continue);
        pdLog('predict_rate: %o  %o  %o', predict_rate1, predict_rate2, predict_rate3);

        mixAll = modules.mergeDeep(mixAll, {
          [uid_league_data.uid]: {
            [uid_league_data.league_id]: {
              countinue: countinue,
              win_bets_continue: win_bets_continue,
              predict_rate1: predict_rate1,
              predict_rate2: predict_rate2,
              predict_rate3: predict_rate3
            }
          }
        });
      });

      s23 = new Date().getTime();
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
          -- and prediction.match_scheduled between :begin and :end
           and (
                    spread_result_flag in (-1, 0.95, 0.5, -0.5) 
                 or totals_result_flag in (-1, 0.95, 0.5, -0.5)
               )
      `, {
        replacements: {
          period: period,
          begin: begin_30days,
          end: end_30days
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      const reformatPrediction = []; // 依 uid league_id 為一個組，並 照 match_scheduled 排序過

      const uidPredictionHistory = modules.groupBy(usersPrediction, 'uid');

      // uidPredictionHistory.map(function(data) {
      for (const data of uidPredictionHistory) {
        const uidLeaguePredictionHistory = modules.groupBy(data, 'league_id');

        uidLeaguePredictionHistory.forEach(function(data2) {
          data2.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
            return b.match_scheduled - a.match_scheduled; // 降 大->小
          });

          reformatPrediction.push({ uid: data2[0].uid, league_id: data2[0].league_id, lists: data2.slice(0, days) });
        });
      };
      // });

      s24 = new Date().getTime();
      pdLog('\n2.4 2.5');
      reformatPrediction.forEach(function(uid_league_data) {
        pdLog('\nuid: %o   league_id: %o', uid_league_data.uid, uid_league_data.league_id);
        //
        // 2.4. 近 Ｎ 場過 Ｎ 場  matches_rate1, matches_rate2
        // acc 累計
        //
        let matches_rate1 = 0; let matches_rate2 = 0;
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

        allRecords.sort(function compare(a, b) {
          return b.winRateAcc - a.winRateAcc; // 降 大->小
        });

        // 要至少計算五場，選擇機率最高者 >= 5場 才給值
        if (allRecords.length >= 5 && allRecords[0].days >= 5) {
          // console.log(allRecords[0])
          matches_rate1 = allRecords[0].days;
          matches_rate2 = allRecords[0].correctCountsAcc;
        };

        //
        // 2.5. 連贏Ｎ場 matches_continue
        //
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
        allRecords2.sort(modules.fieldSorter(['-match_scheduled', '-correctMark']));
        allRecords2.every(function(data, index) {
          matches_continue = index;
          return data.correctMark !== '0' || data.correctMark !== '-1'; // 代表過盤
        });

        //
        // 將結果合併到 mixAll  依uid、league_id、 整個戰績名稱
        //
        pdLog('matches_rate: %o  %o', matches_rate1, matches_rate2);
        pdLog('matches_continue: %o', matches_continue);

        mixAll = modules.mergeDeep(mixAll, {
          [uid_league_data.uid]: {
            [uid_league_data.league_id]: {
              matches_rate1: matches_rate1,
              matches_rate2: matches_rate2,
              matches_continue: matches_continue
            }
          }
        });
      });

      // 把 所有計算出來的資料寫入 Title
      for (const [uid, value] of Object.entries(mixAll)) {
        pdLog('\nuid: ', uid);
        for (const [league_id, value2] of Object.entries(value)) {
          pdLog('league_id: ', league_id);
          pdLog('value2: ', value2);
          try {
            const r = await db.Title.update({
              countinue: value2.countinue,
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
            });

            if (r[0] === 1) result.status['1'].lists.push({ uid: uid, league: league_id, period: period });
          } catch (err) {
            console.error(err);
            if (err.parent.code === 'ER_LOCK_DEADLOCK') return reject(errs.errsMsg('404', '13501'));
            if (err.parent.code === 'ER_DUP_ENTRY') return reject(errs.errsMsg('404', '13502'));
            return reject(errs.errsMsg('404', '13503'));
          }
        };
      };
    } catch (err) {
      console.error('Error 2. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const e = new Date().getTime();
    console.log('\n settleGodTitleModel 1# %o ms   2# %o ms   21# %o ms   22# %o ms   23# %o ms   24# %o ms',
      s2 - s1, s21 - s2, s22 - s21, s23 - s22, s24 - s23, e - s24);
    return resolve(result);
  });
}

function numberRate(num1, num2, f = 2) {
  // console.log('numberRate: %o / %o', Number(num1), Number(num2));
  return Number(num2) === 0
    ? 0
    : Number(Number(num1) / Number(num2)).toFixed(f);
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

  item.totalsCountAcc = preTotalsCountAcc + [0.95, 0.5, -1, -0.5].includes(result_flag) ? 1 : 0;
  item.correctCountsAcc = preCorrectCountsAcc + [0.95, 0.5].includes(result_flag) ? 1 : 0;
  item.winRateAcc = (item.totalsCountAcc === 0)
    ? 0
    : numberRate(item.correctCountsAcc, item.totalsCountAcc) * 100; // 勝率 * 100

  n++;
  item.days = n;

  return { n: n, item: item };
}

// 連贏Ｎ場 計算專用的
// 回傳 場數, (場數, 開賽時間, 過盤註記)
function passN(n, result_flag, match_scheduled) {
  const item = {};

  n++;
  item.days = n;
  item.match_scheduled = match_scheduled;
  item.correctMark = [0.95, 0.5].includes(result_flag)
    ? 1
    : [-1, -0.5].includes(result_flag)
      ? -1
      : 0;

  return { n: n, item: item };
}

// https://stackoverflow.com/a/1215401
// const DEBUG = true;
// const old_console_log = console.log;
// console.log = function() {
//   if (DEBUG) {
//     old_console_log.apply(this, arguments);
//   }
// };

module.exports = settleGodTitle;
