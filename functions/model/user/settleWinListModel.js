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
    //    b. 記錄 勝率、勝注、勝場數、總場數  今日、周、月、季
    //    c. 將 勝率、勝注 計算結果 直接累加寫入 這星期、這個月、這賽季、本期大神
    //    d. 比賽結束跨日，結算要判斷 執行日期 不同 開賽日期，意謂 跨日比賽結速，要重算前天勝率、勝注

    // 勝率的計算比較特別，需要 總勝數 和 勝數

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
    // 2.
    try {
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
      console.log('resultWinList: ', resultWinList);

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
            fields: ['uid', 'league_id', 'date', 'period', 'week', 'month', 'season']
          });

          result.push({ status: 1, msg: '使用者-聯盟資料更新成功！', uid: data.uid, league: data.league_id });
        });

        await Promise.all(upsertResult);
      } catch (err) {
        return reject(errs.errsMsg('404', '1317'));
      }
    } catch (err) {
      console.error('Error 2. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const e = new Date().getTime();
    console.log('\n');
    console.log('1. ', s2 - s1);
    console.log('2. ', e - s2);
    return resolve(result);
  });
}

module.exports = settleWinList;
