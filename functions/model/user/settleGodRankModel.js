/* eslint-disable no-unused-vars */
const { leagueCodebook, leagueDecoder } = require('../../util/modules');
const {
  convertTimezone, getTitlesPeriod, moment, checkUserRight,
  predictionsWinList
} = require('../../util/modules');

const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

const d = require('debug')('user:settleWinListModel');

async function settleGodRank(args) {
  return new Promise(async function(resolve, reject) {
  // 兩週審核一次 , 週一更新  周日早上 00:00 計算
  // 同時在同一聯盟得到鑽石大神及金銀銅大神，以鑽石大神為主
  // 鑽大神 5位
  // 1. 第一週最少 10 注, 兩週總數至少 30 注
  // 2. 贏為正數, 輸為負數, 該聯盟注數正負相加之總和, 至少 >= 5
  // 3. 如有相同數值者會先以 兩週注數量 為排名判斷
  // 4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  // 5. 再有相同者, 下注機率的排名

    // 金 銀 銅 各10位
    // 1. 第一週最少 10 注, 兩週總數至少 30 注
    // 2. 下注機率至少超過 60% 的勝率
    // 3. 如有相同機率者會先以 兩週注數量 為排名判斷
    // 4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
    // 5. 再有相同者, 該聯盟注數正負相加之總和排名
    const uid = args.token.uid;
    const league_id = args.body.league_id;
    const now = new Date();
    const currentSeason = moment().year();
    const currentMonth = moment().month();
    const period = getTitlesPeriod(now).period;

    /* common calculate & diamond calculate */
    const result = await db.sequelize.query(
    `
      SELECT
      uid,
      league_id,
      this_period_win_bets,
       (
          SELECT SUM(correct_counts+fault_counts)
            FROM users__win__lists__histories uwlh
            WHERE uid = $uid
              AND uwl.league_id = uwlh.league_id
              AND season = $currentSeason
              AND month  = $currentMonth
              
        ) first_week_win_handicap,
        (
          SELECT SUM(correct_counts+fault_counts)
            FROM users__win__lists__histories uwlh
            WHERE uid = $uid
              AND uwl.league_id = uwlh.league_id
              AND season = $currentSeason
              AND month  = $currentMonth
              
        ) this_period_win_handicap
        FROM users__win__lists uwl
    
        
    `,
    {
      bind: { period: period, uid: uid, league_id: league_id, currentSeason: currentSeason, currentMonth: currentMonth },
      type: db.sequelize.QueryTypes.SELECT
    }
    );
    resolve(result);
  });
}

module.exports = settleGodRank;
