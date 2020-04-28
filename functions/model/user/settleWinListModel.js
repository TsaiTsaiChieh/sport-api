const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function settleWinList(args) {
  return new Promise(async function(resolve, reject) {
    // 1. 管理者才能進行 API 呼叫
    // 2. 需要另一支排程進行
    //    a. 取得 這個星期的星期一日期、這個月第一天日期，更新 上星期、上個月記錄，並清空 本星期、本月記錄 設為 0
    //    b. 賽季開打 更新 上賽季記錄，並清空 本賽季記錄，設為 0
    //    c. 大神計算完畢 更新 上期大神記錄，並清空 本期記錄，設為 0
    // 3.
    //    a. 今日 預測單 區分聯盟 且 比賽 為 有效、比賽結束 且 讓分或大小 有結果(result_flas) 的 預測單
    //    b. 將 勝率、勝注、勝場數、總場數 計算結果 今日、周、月、季 先寫入歷史 user__win__lists__history
    //    c. 再從 歷史 將 勝率、勝注 依照累加計算寫入 這星期、這個月、這賽季、本期大神
    //    !! 比賽結束跨日，結算要判斷 執行日期 不同 開賽日期，意謂 跨日比賽結束，要重算前天勝率、勝注

    // 勝率的計算比較特別，需要 總勝數(勝數+敗數) 和 勝數

    const userUid = args.token.uid;
    const begin = modules.convertTimezone(args.date);
    const end = modules.convertTimezone(args.date, { op: 'add', value: 1, unit: 'days' }) - 1;
    const period = modules.getTitlesPeriod(begin * 1000).period;
    const dayOfYear = modules.moment(begin * 1000).format('DDD'); // 日期是 一年中的第幾天
    const week = modules.moment(begin * 1000).week();
    const momentObject = modules.moment(begin * 1000).toObject();
    const month = momentObject.months + 1;
    const season = momentObject.years;

    const result = [];

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
      // 回寫結果
      try {
        const upsertResult = resultWinList.map(async function(data) {
          const r = await db.Users_WinListsHistory.upsert({
            uid: data.uid,
            league_id: data.league_id,
            win_bets: data.win_bets,
            win_rate: data.win_rate,
            correct_counts: data.correct_counts,
            fault_counts: data.fault_counts,
            date: dayOfYear,
            period: period,
            week: week,
            month: month,
            season: season
          },
          {
            fields: ['win_bets', 'win_rate', 'correct_counts', 'fault_counts']
          });

          result.push({ status: 1, msg: '使用者-聯盟 歷史勝注勝率資料更新成功！', uid: data.uid, league: data.league_id });
        });

        await Promise.all(upsertResult);
      } catch (err) {
        return reject(errs.errsMsg('404', '1317'));
      }

      s22 = new Date().getTime();
      // c.
      // 這星期、這個月、這賽季、本期大神 
      // this_week、this_month、this_season、this_period
      try {
        const updateResult = resultWinList.map(async function(data) {
          const allTotalCount = await winBetsRateTotalCount(data.uid, data.league_id, 
            dayOfYear, week, month, season, period);

          // 檢查 是否有5筆資料
          if (allTotalCount.length !== 5) return reject(errs.errsMsg('404', '1322')); // 筆數異常

          // 檢查是否為數字
          const ele = allTotalCount;
          const this_week_win_rate = numberCount(ele[1].correct_sum, ele[1].fault_sum);
          const this_month_win_rate = numberCount(ele[2].correct_sum, ele[2].fault_sum);
          const this_period_win_rate = numberCount(ele[3].correct_sum, ele[3].fault_sum);
          const this_season_win_rate = numberCount(ele[4].correct_sum, ele[4].fault_sum);

          if (isNotANumber(this_week_win_rate)) return reject(errs.errsMsg('404', '1323'));
          if (isNotANumber(this_month_win_rate)) return reject(errs.errsMsg('404', '1323'));
          if (isNotANumber(this_period_win_rate)) return reject(errs.errsMsg('404', '1323'));
          if (isNotANumber(this_season_win_rate)) return reject(errs.errsMsg('404', '1323'));

          // row: 0 date, 1 week, 2 month, 3 period, 4 season
          // 0 date 目前未使用
          // 回寫結果 到users__win__lists
          try {
            const r = await db.Users_WinLists.upsert({
              uid: data.uid,
              league_id: data.league_id,
              this_week_win_rate: this_week_win_rate,
              this_week_win_bets: ele[1].sum,
              this_month_win_rate: this_month_win_rate,
              this_month_win_bets: ele[2].sum,
              this_period_win_rate: this_period_win_rate,
              this_period_win_bets: ele[3].sum,
              this_season_win_rate: this_season_win_rate,
              this_season_win_bets: ele[4].sum
            }, {
              fields: [
                'this_week_win_rate', 'this_week_win_bets', 
                'this_month_win_rate', 'this_month_win_bets', 
                'this_period_win_rate', 'this_period_win_bets', 
                'this_season_win_rate', 'this_season_win_bets'
              ]
            });

            if (r) return reject(errs.errsMsg('404', '1320')); // 更新筆數異常

            result.push({ status: 1, msg: '使用者-聯盟 勝注勝率資料更新成功！', uid: data.uid, league: data.league_id });
          } catch (err) {
            return reject(errs.errsMsg('404', '1321'));
          }
        });

        await Promise.all(updateResult);
      } catch (err) {
        return reject(errs.errsMsg('404', '1319'));
      }

    } catch (err) {
      console.error('Error 3. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const e = new Date().getTime();
    console.log('\n 1. %o ms   21. %o ms   22. %o ms   e. %o ms', s2 - s1, s21 - s2, s22 - s21, e - s22);
    return resolve(result);
  });
}

// 計算出 本周、本月、本期、本賽季 統計資料
// 輸出資料要確定是否5筆
// rang： date、week、month、season、period
// sum(win_bets), sum(correct_counts), sum(fault_counts)
async function winBetsRateTotalCount(uid, league_id, date=0, week=0, month=0, season=0, period=0){
  return await db.sequelize.query(`
    select date, '' week, '' month, '' season, '' period,
           sum(win_bets) sum, sum(correct_counts) correct_sum, sum(fault_counts) fault_sum
      from users__win__lists__histories
     where uid = :uid
       and league_id = :league_id
       and date = ${date}
     group by date
    union
    select '' date, week, '' month, '' season, '' period,
           sum(win_bets) sum, sum(correct_counts) correct_sum, sum(fault_counts) fault_sum
      from users__win__lists__histories
     where uid = :uid
       and league_id = :league_id
       and week = ${week}
     group by week
    union
    select '' date, '' week, month, '' season, '' period,
           sum(win_bets) sum, sum(correct_counts) correct_sum, sum(fault_counts) fault_sum
      from users__win__lists__histories
     where uid = :uid
       and league_id = :league_id
       and month = ${month}
     group by month
    union
    select '' date, '' week, '' month, '' season, period,
          sum(win_bets) sum, sum(correct_counts) correct_sum, sum(fault_counts) fault_sum
      from users__win__lists__histories
     where uid = :uid
       and league_id = :league_id
       and period = ${period}
     group by period
     union
    select '' date, '' week, '' month, season, '' period,
           sum(win_bets) sum, sum(correct_counts) correct_sum, sum(fault_counts) fault_sum
      from users__win__lists__histories
     where uid = :uid
       and league_id = :league_id
       and season = ${season}
     group by season
  `, {
    replacements: {
      uid: uid,
      league_id: league_id
    },
    //logging: console.log,
    type: db.sequelize.QueryTypes.SELECT
  });
}

function numberCount(num1, num2, f=2){
  //console.log('numberCount: %o / %o', Number(num1), ( Number(num1) + Number(num2)));
  return Number(
    Number(num1) / ( Number(num1) + Number(num2) )
  ).toFixed(f);
}

function isNotANumber(inputData) { 
　// isNaN(inputData)不能判斷空串或一個空格 
　// 如果是一個空串或是一個空格，而isNaN是做為數字0進行處理的，
  // 而parseInt與parseFloat是返回一個錯誤訊息，這個isNaN檢查不嚴密而導致的。 
　if (parseFloat(inputData).toString() == 'NaN') { 
　　　//alert(“請輸入數字……”); 
　　　return true; 
　} else { 
　　　return false; 
　} 
}

module.exports = settleWinList;
