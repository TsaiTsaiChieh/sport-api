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
  //1. 第一週最少 10 注, 兩週總數至少 30 注
  //2. 贏為正數, 輸為負數, 該聯盟注數正負相加之總和, 至少 >= 5
  //3. 如有相同數值者會先以 兩週注數量 為排名判斷
  //4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  //5. 再有相同者, 下注機率的排名

  // 金 銀 銅 各10位
  //1. 第一週最少 10 注, 兩週總數至少 30 注
  //2. 下注機率至少超過 60% 的勝率
  //3. 如有相同機率者會先以 兩週注數量 為排名判斷
  //4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  //5. 再有相同者, 該聯盟注數正負相加之總和排名
  const uid = args.token.uid;
  const league_id = args.body.league_id
  const now = new Date();
  const currentSeason = moment().year();
  const currentMonth = moment().month();
  const period = getTitlesPeriod(now).period;

  /*common calculate & diamond calculate*/
  const diamond = await db.sequelize.query(
    `
      SELECT  league_id, substring_index(group_concat(DISTINCT uid ORDER BY rank.this_period_win_bets DESC, rank.this_period_win_handicap DESC  SEPARATOR ','), ',', 10) as uids
      FROM
      (
          SELECT
            uid,
            league_id,
            this_period_win_bets,
            this_period_win_rate,
            (
                SELECT SUM(correct_counts+fault_counts)
                  FROM users__win__lists__histories uwlh
                  WHERE uwl.league_id = uwlh.league_id
                    AND season = $currentSeason
                    AND MONTH  = $currentMonth
              ) first_week_win_handicap,
              (
                SELECT SUM(correct_counts+fault_counts)
                  FROM users__win__lists__histories uwlh
                  WHERE uwl.league_id = uwlh.league_id
                    AND season = $currentSeason
                    AND MONTH  = $currentMonth
              ) this_period_win_handicap,
              (
                  SELECT SUM(correct_counts+fault_counts)
                  FROM users__win__lists__histories uwlh
                  WHERE uwl.league_id = uwlh.league_id
              ) this_league_win_handicap 
              FROM users__win__lists uwl
              GROUP BY uid, league_id
              ORDER BY uwl.league_id ASC
      ) rank
      WHERE rank.first_week_win_handicap >=10
        AND rank.this_period_win_handicap >=30
        AND rank.this_period_win_bets >=5
      GROUP BY league_id
    `,
    { 
      bind: { period:period, uid:uid, league_id:league_id, currentSeason:currentSeason, currentMonth:currentMonth },
      type: db.sequelize.QueryTypes.SELECT 
    }

  );

  const diamond_list = [];

  diamond.forEach(function(items) { // 這裡有順序性
    diamond_list.push(repackage(items));
  });

  resolve(diamond_list);
  /*gold silver copper calculate*/
  const gsc = await db.sequelize.query(
    `
    SELECT  uid, 
      league_id, 
      this_period_win_bets, 
      this_period_win_rate, 
      first_week_win_handicap, 
      this_period_win_handicap, 
      this_league_win_handicap, 
      league_id,  
      substring_index(group_concat(uid SEPARATOR ','), ',', 10) as uids
    FROM
    (
    SELECT
      uid,
      league_id,
      this_period_win_bets,
      this_period_win_rate,
      (
          SELECT SUM(correct_counts+fault_counts)
            FROM users__win__lists__histories uwlh
            WHERE uid = $uid
              AND uwl.league_id = uwlh.league_id
              AND season = $currentSeason
              AND MONTH  = $currentMonth
        ) first_week_win_handicap,
        (
          SELECT SUM(correct_counts+fault_counts)
            FROM users__win__lists__histories uwlh
            WHERE uid = $uid
              AND uwl.league_id = uwlh.league_id
              AND season = $currentSeason
              AND MONTH  = $currentMonth
        ) this_period_win_handicap,
        (
            SELECT SUM(correct_counts+fault_counts)
            FROM users__win__lists__histories uwlh
            WHERE uid = $uid
              AND uwl.league_id = uwlh.league_id
        ) this_league_win_handicap 
        FROM users__win__lists uwl
        GROUP BY uid, league_id
        ORDER BY uwl.league_id, uwl.this_period_win_bets, this_period_win_handicap DESC
    ) rank
    WHERE rank.first_week_win_handicap >=10
    AND rank.this_period_win_handicap >=30
    AND rank.this_period_win_bets >=0.6
    AND rank.league_id = $league_id
    GROUP BY league_id
    `,
    { 
      bind: { period:period, uid:uid, league_id:league_id, currentSeason:currentSeason, currentMonth:currentMonth },
      type: db.sequelize.QueryTypes.SELECT 
    } 
    
    
  );

  // resolve(result);
  });
  
}
function repackage(ele){
  const data = {
    'league_id':ele.league_id,
    'uids':ele.uids
  };

  return data;
}

module.exports = settleGodRank;
