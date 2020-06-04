/* eslint-disable no-unused-vars */
const {
  getTitlesPeriod, moment
} = require('../../util/modules');

const db = require('../../util/dbUtil');

/* 鑽石、金、銀、銅 對應表 */
const related = ['diamond', 'gold', 'silver', 'copper'];

async function settleGodRank(args) {
  // 兩週審核一次 , 週一更新  周日早上 00:00 計算
  // 同時在同一聯盟得到鑽石大神及金銀銅大神，以鑽石大神為主
  // 鑽大神 5位
  // 1. 第一週最少 10 注, 兩週總數至少 30 注
  // 2. 贏為正數, 輸為負數, 該聯盟注數正負相加之總和, 至少 >= 5
  // 3. 如有相同數值者會先以 兩週注數量 為排名判斷
  // 4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  // 5. 再有相同者, 下注機率的排名
  // 6. 預防再有重複，新增最後一筆下注時間判斷?

  // 金 銀 銅 各10位
  // 1. 第一週最少 10 注, 兩週總數至少 30 注
  // 2. 下注機率至少超過 60% 的勝率
  // 3. 如有相同機率者會先以 兩週注數量 為排名判斷
  // 4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  // 5. 再有相同者, 該聯盟注數正負相加之總和排名
  // 6. 預防再有重複，新增最後一筆下注時間判斷?
  const uid = args.token.uid;
  const league_id = args.body.league_id;
  const now = new Date();
  const currentSeason = moment().year();
  const currentMonth = moment().month();
  const period = getTitlesPeriod(now).period;
  const period_date = getTitlesPeriod(now).date;

  /* 重置大神為一般玩家 */
  await resetGod2Player();

  /* common calculate & diamond calculate */
  const diamond = await db.sequelize.query(
      `
        SELECT  league_id, 
                substring_index(group_concat(DISTINCT rank.uid ORDER BY rank.this_period_win_bets DESC, rank.this_period_win_handicap DESC  SEPARATOR ","), ',', 10) as uids,
                this_period_win_bets,
                this_period_win_rate
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
    generateGSC(period, period_date, uid, currentSeason, currentMonth, items);/* 產生金銀銅大神 */
  });
}
/* 整理鑽石大神資料 */
function repackage(period, period_date, uid, currentSeason, currentMonth, ele) {
  const data = {
    type: 'diamond',
    league_id: ele.league_id,
    uids: ele.uids
  };
  updateGod('1', 'rank1', ele);// 更新大神狀態
  insertTitle('1', ele, period, period_date);// 寫入大神歷史戰績(鑽石)
  updateWins(ele);// 本期勝率/勝注移到上期、本期勝率/勝注清空

  return data;
}
/* 整理金銀銅大神資料 */
function repackageGSC(period, period_date, uid, currentSeason, currentMonth, ele) {
  /* uids(comma) transfer into array */
  const uids_array = ele.uids.split(',');
  /* 金牌 銀牌 銅牌大神寫入 */
  const related = ['gold', 'silver', 'copper'];
  for (var i = 2; i <= 4; i++) {
    const range = 5;/* 取多少個uid為一個大神範圍 */
    const from = (i - 2) * range;/* 計算開始uid */
    const to = (i - 1) * range;/* 計算結尾uid */
    const rank = 'rank' + i;
    const god = {
      type: related[i],
      league_id: ele.league_id,
      uids: uids_array.slice(from, to)
    };

    updateGod(i, rank, god);// 更新大神狀態
    insertTitle(i, god, period, period_date);// 寫入大神歷史戰績(金、銀、銅)
  }
  // const data = {
  //   'gold':god[1],
  //   'silver':god[2],
  //   'copper':god[3]
  // };
  // return god;
}
/* 產生金銀銅大神 */
async function generateGSC(period, period_date, uid, currentSeason, currentMonth, ele) {
// await ele_list.forEach(function(ele) {
  /* gold silver copper calculate */
  const gsc_list = [];
  const gsc = await db.sequelize.query(
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
      bind: { period: period, uid: uid, league_id: ele.league_id, currentSeason: currentSeason, currentMonth: currentMonth },
      type: db.sequelize.QueryTypes.SELECT
    });

  gsc.forEach(function(items) {
    gsc_list.push(repackageGSC(period, period_date, uid, currentSeason, currentMonth, items));
  });
// });
}

/* 寫入大神歷史戰績 */
function insertTitle(rank_id, ele, period, period_date) {
  const next_period = period;
  const uids = ele.uids.toString();
  const uids_array = uids.split(',');
  const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  uids_array.forEach(function(uid) {
    if (uid !== '') {
      db.sequelize.query(
        `
          INSERT INTO titles ( uid, period, period_date, league_id, rank_id, createdAt, updatedAt)
          VALUES
          (:uid, :period, :period_date, :league_id, :rank_id, :updatedAt, :updatedAt);
        `,
        {
          replacements: { uid: uid, period: next_period, period_date: period_date, league_id: ele.league_id, rank_id: rank_id, updatedAt: updatedAt },
          type: db.sequelize.QueryTypes.INSERT
        }
      );
    }
  });
}
/* 把全部這期資料移到上一期 */
function updateWins(ele) {
  const last_period_win_bets = ele.this_period_win_bets;
  const last_period_win_rate = ele.this_period_win_rate;
  const league_id = ele.league_id;
  const uids_array = ele.uids.toString().split(',');
  uids_array.forEach(function(uid) {
    db.sequelize.query(
      `
      UPDATE users__win__lists 
         SET 
             last_period_win_bets = $last_period_win_bets,
             last_period_win_rate = $last_period_win_rate,
             this_period_win_bets = NULL,
             this_period_win_rate = NULL
       WHERE uid = $uid
         AND league_id = $league_id
      `,
      {
        logging: true,
        bind: { last_period_win_bets: last_period_win_bets, last_period_win_rate: last_period_win_rate, league_id: league_id, uid: uid },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
  });
}
/* 大神更新 */
async function updateGod(i, god_type, ele) {
  /* uids(comma) to string then array */
  const uids_array = ele.uids.toString().split(',');
  uids_array.forEach(function(uid) {
    /* 預防uid是空值 */
    if (uid !== '') {
      db.sequelize.query(
        `
          UPDATE users 
            SET status=2,
                default_god_league_rank=:league_id,
                ${god_type}_count=rank${i}_count+1
          WHERE 
                uid = '${uid}'
        `,
        {
          logging: true,
          replacements: { league_id: ele.league_id },
          type: db.sequelize.QueryTypes.UPDATE
        });
    }
  });
  return 1;
}

/* 重置大神為一般使用者 */
function resetGod2Player() {
  /* 將所有使用者及大神重置為一般使用者暨預設聯盟的大神為NULL，排除管理者(status=9) */
  db.sequelize.query(
    `
      UPDATE users SET status=1, default_god_league_rank=NULL WHERE status != 9
    `,
    {
      type: db.sequelize.QueryTypes.UPDATE
    });
}

module.exports = settleGodRank;
