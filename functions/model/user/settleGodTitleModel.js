const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

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
    //===============

    const userUid = args.token.uid;
    const period = args.period;
    const days = 30;

    // 近 30 天
    const end = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'));
    const begin = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'),
      { op: 'subtract', value: days, unit: 'days' }) - 1;

    const result = {
      status: {
        '1': {
          msg: '使用者-聯盟 歷史勝注勝率資料更新成功！',
          lists: []
        },
        '2': {
          msg: '使用者-聯盟 勝注勝率資料更新成功！',
          lists: []
        },
        '3': {
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
    let s25 = 0;
    // 2.
    try {
      // a. 使用 users__win__lists_histories
      // 注意 !!!  正式有資料後，要把 今日日期區間判斷 打開來
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
          begin: begin,
          end: end
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      const reformatHistory = []; // 依 uid league_id 為一個組，並 照 date_timestamp 排序過

      const uidHistory = modules.groupBy(usersWinListsHistories, 'uid');

      uidHistory.map(function(data){
        const uidLeagueHistory = modules.groupBy(data, 'league_id');

        uidLeagueHistory.forEach(function(data2){
          data2.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
            //console.log('a. %o  b. %o  %o', a.date_timestamp, b.date_timestamp, a.date_timestamp - b.date_timestamp)
            return b.date_timestamp - a.date_timestamp; // 降 大->小
          });

          reformatHistory.push({uid: data2[0].uid, league_id: data2[0].league_id, lists: data2.slice(0, days)})
        });
        
      });

      // 依 使用者-聯盟 進行 稱號判斷
      // console.log('usersWinListsHistories: ', usersWinListsHistories);
      // console.log('uidHistory: ', uidHistory);
      // console.log('uidLeagueUidHistory: ', uidLeagueUidHistory);

      
      reformatHistory.forEach(function(uid_league_data){
        // 2.1. 連贏Ｎ天 countinue
        let countinue = 0;
        uid_league_data.lists.every(function(lists, index){
          //console.log('uid: %o  league_id: %o  %o', uid_league_data.uid, uid_league_data.league_id, lists);
          countinue = index;
          return ((lists.correct_counts - lists.fault_counts) > 0 ) ? true : false; // 代表過盤
        });


        // 2.2. 勝注連過 Ｎ日 win_bets_continue
        let win_bets_continue = 0;
        uid_league_data.lists.every(function(lists, index){
          win_bets_continue = index;
          return (lists.win_bets > 0 ) ? true : false; // 代表過盤
        });


        // 2.3. 近 Ｎ日 Ｎ過 Ｎ 和 近 Ｎ日 過 Ｎ  predict_rate1、predict_rate2、predict_rate3
        // acc 累計
        let predict_rate1,predict_rate2, predict_rate3 = 0;
        let allRecords = []; // 記錄所有資料

        uid_league_data.lists.forEach(function(lists, index){
          const item = {};
          item.days = index + 1;

          if (index === 0){ // 第一筆 直接計算
            item['totalsCountAcc'] = (lists.correct_counts + lists.fault_counts);
            item['correctCountsAcc'] = lists.correct_counts;
          } else { // 第二筆之後 要累計
            item['totalsCountAcc'] = allRecords[index - 1].totalsCountAcc + (lists.correct_counts + lists.fault_counts);
            item['correctCountsAcc']  = allRecords[index - 1].correctCountsAcc + lists.correct_counts;
          }

          item['winRateAcc'] = (item.totalsCountAcc === 0) 
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


        console.log('countinue: %o  win_bets_continue: %o', countinue, win_bets_continue);
        console.log('predict_rate: %o  %o  %o', predict_rate1, predict_rate2, predict_rate3)
      });



      //b. 使用 users_predictions
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
          begin: begin,
          end: end
        },
        logging: console.log,
        type: db.sequelize.QueryTypes.SELECT
      });

      const reformatPrediction = []; // 依 uid league_id 為一個組，並 照 match_scheduled 排序過

      const uidPredictionHistory = modules.groupBy(usersPrediction, 'uid');

      uidPredictionHistory.map(function(data){
        const uidLeaguePredictionHistory = modules.groupBy(data, 'league_id');

        uidLeaguePredictionHistory.forEach(function(data2){
          data2.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
            return b.match_scheduled - a.match_scheduled; // 降 大->小
          });

          reformatPrediction.push({uid: data2[0].uid, league_id: data2[0].league_id, lists: data2.slice(0, days)})
        });
        
      });

      reformatPrediction.forEach(function(uid_league_data){
        // 2.4. 近 Ｎ 場過 Ｎ 場  matches_rate1、matches_rate2
        // acc 累計
        let matches_rate1, matches_rate2 = 0;
        let allRecords = []; // 記錄所有資料

        uid_league_data.lists.forEach(function(lists, index){
          const item = {};
          item.days = index + 1;

          item['totalsCountAcc'] = 0;
          item['correctCountsAcc'] = 0;

          item['totalsCountAcc'] =+ [0.95, 0.5, -1, -0.5].includes(lists.spread_result_flag)? 1 : 0;
          item['totalsCountAcc'] =+ [0.95, 0.5, -1, -0.5].includes(lists.totals_result_flag)? 1 : 0;

          if (index === 0){ // 第一筆 直接計算
            item['totalsCountAcc'] = [0.95, 0.5, -1, -0.5].includes(lists.spread_result_flag)? 1 : 0;
            item['totalsCountAcc'] =+ [0.95, 0.5, -1, -0.5].includes(lists.totals_result_flag)? 1 : 0;
            item['correctCountsAcc'] = [0.95, 0.5].includeslists.spread_result_flag? 1 : 0;
            item['correctCountsAcc'] =+ [0.95, 0.5].includeslists.totals_result_flag? 1 : 0;
          } else { // 第二筆之後 要累計
            item['totalsCountAcc'] = allRecords[index - 1].totalsCountAcc + (lists.correct_counts + lists.fault_counts);
            item['correctCountsAcc']  = allRecords[index - 1].correctCountsAcc + lists.correct_counts;
          }

          item['winRateAcc'] = (item.totalsCountAcc === 0) 
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



        // 2.5. 連贏Ｎ場 matches_continue
        let matches_continue = 0;

      });

    } catch (err) {
      console.error('Error 2. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const e = new Date().getTime();
    console.log('\n settleWinListModel 1# %o ms   2# %o ms   21# %o ms   22# %o ms   23# %o ms', 
      s2 - s1, s21 - s2, s22 - s21, s23 - s22, e - s23);
    return resolve(result);
  });
}

function numberRate(num1, num2, f=2){
  //console.log('numberCount: %o / %o', Number(num1), ( Number(num1) + Number(num2)));
  return Number(
    Number(num1) /  Number(num2 )
  ).toFixed(f);
}

// 勝場才記錄，其它不用記錄
function wlMark(num){
  if ([0.95, 0.5].includes(num)) { return 1 };
  // if ([-1, -0.5].includes(num)) { return -1 };
  return 0;
}

module.exports = settleGodTitle;
