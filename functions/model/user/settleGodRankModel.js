/* eslint-disable no-unused-vars */
// const { leagueCodebook, leagueDecoder } = require('../../util/modules');
const {
  getTitlesPeriod, moment
} = require('../../util/modules');


const db = require('../../util/dbUtil');

/*鑽石、金、銀、銅 對應表*/
const related = ["diamond","gold","silver","copper"];

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
    const period_date = getTitlesPeriod(now).date;

    /*重置大神為一般玩家*/
    // resetGod2Player();

    /* common calculate & diamond calculate */
    const diamond = await db.sequelize.query(
    `
      SELECT  league_id, substring_index(group_concat(DISTINCT rank.uid ORDER BY rank.this_period_win_bets DESC, rank.this_period_win_handicap DESC  SEPARATOR ","), ',', 10) as uids
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
      bind: { period: period, uid: uid, league_id: league_id, currentSeason: currentSeason, currentMonth: currentMonth },
      type: db.sequelize.QueryTypes.SELECT
    }

    );

    const diamond_list = [];
    diamond.forEach(function(items) { // 這裡有順序性
      diamond_list.push(repackage(period, period_date, uid, currentSeason, currentMonth, items));
      generateGSC(period, uid, currentSeason, currentMonth, items);
    });


  });
}
function repackage(period, period_date, uid, currentSeason, currentMonth, ele) {
  const data = {
    type: 'diamond',
    league_id: ele.league_id,
    uids: ele.uids
  };
  updateGod('rank1', ele);
  insertTitle('1', ele, period, period_date);
  return data;
}
function repackageGSC(ele, period){
  const uids_array = ele.uids.split(',');
    /*金牌 銀牌 銅牌大神寫入*/
    
    // for(var i=2;i<=4;i++){
      const gold = {
        'type':related[i],
        'league_id':ele.league_id,
        'uids':uids_array.slice(0, 5)
      };

      updateGod('rank2',gold);
      insertTitle(2, gold, period, period_date);
    // }
    // const data = {
    //   'gold':gold,
    //   'silver':silver,
    //   'copper':copper
    // };
    return gold;
}

function generateGSC(period, uid, currentSeason, currentMonth, ele){
  // ele_list.forEach(function(ele) {
    /*gold silver copper calculate*/
    const gsc_list = [];
    const gsc = db.sequelize.query(
      `
      SELECT  
          uid, 
          league_id, 
          this_period_win_bets, 
          this_period_win_rate, 
          first_week_win_handicap, 
          this_period_win_handicap, 
          this_league_win_handicap, 
          league_id,  
          substring_index(group_concat(uid SEPARATOR ","), ',', 10) as uids
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
              
          ) first_week_win_handicap,
          (
            SELECT SUM(correct_counts+fault_counts)
              FROM users__win__lists__histories uwlh
              WHERE uwl.league_id = uwlh.league_id
               
          ) this_period_win_handicap,
          (
              SELECT SUM(correct_counts+fault_counts)
              FROM users__win__lists__histories uwlh
              WHERE uwl.league_id = uwlh.league_id
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
        bind: { period:period, uid:uid, league_id:ele.league_id, currentSeason:currentSeason, currentMonth:currentMonth },
        type: db.sequelize.QueryTypes.SELECT 
      });
      console.log('-----------------');
      console.log(gsc);return;
      gsc.forEach(function(items) { 
    
        gsc_list.push(repackageGSC(items, period));
      });
  // });
  
  
}



/*寫入稱號*/
async function insertTitle(rank_id, ele, period, period_date){
  const uids_array = ele.uids.split(',');
  const updatedAt =  moment().format('YYYY-MM-DD HH:mm:ss')
  uids_array.forEach(function(uid){
    db.sequelize.query(
      `
        INSERT INTO titles ( uid, period, period_date, league_id, rank_id, createdAt, updatedAt)
        VALUES
        (:uid, :period, :period_date, :league_id, :rank_id, :updatedAt, :updatedAt);
      `,
      {
        replacements: { uid:uid, period: period, period_date:period_date, league_id:ele.league_id, rank_id:rank_id, updatedAt:updatedAt },
        type: db.sequelize.QueryTypes.INSERT
      }
    );
  });
}
/*把全部這期資料移到上一期*/
function updateWins(ele){
  const last_period_win_bets = ele.this_period_win_bets;
  const last_period_win_rate = ele.this_period_win_rate;
  db.sequelize.query(
    `
      UPDATE INTO user__win__lists 
         SET last_period_win_bets = $last_period_win_bets
         AND last_period_win_rate = $last_period_win_rate
         AND this_period_win_bets = NULL
         AND this_period_win_rate = NULL
       WHERE league_id = $league_id
         AND uid = $uid
    `,
    {
      logging:true,
      replacements: { last_period_win_bets:last_period_win_bets, last_period_win_rate:last_period_win_rate, league_id:league_id, uid:uid },
      type: db.sequelize.QueryTypes.UPDATE
    }
  )
}

/*大神更新*/
function updateGod(god_type, ele){
  const uids = ele.uids;
  const update = db.sequelize.query(
    `
      UPDATE users 
         SET status=2,
             default_god_league_rank=:league_id,
             ${god_type}_count=rank1_count+1
       WHERE 
             uid in ('${uids}')
         AND status NOT IN (1, 9)
    `,
    { 
      logging:true,
      replacements: { league_id:ele.league_id, uids:uids},
      type: db.sequelize.QueryTypes.UPDATE 
    });
    return update;
}



/*重置大神為一般使用者*/
function resetGod2Player(){
  db.sequelize.query(
    `
      UPDATE users SET status=1, default_god_league_rank=NULL
    `,
    { 
      type: db.sequelize.QueryTypes.UPDATE 
    });
}
module.exports = settleGodRank;
