const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function honorModel(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      // SELECT uwl.league_id, uwl.this_month_win_bets, uwl.this_month_win_rate
      //     FROM users__win__lists uwl, users__win__lists__histories uwlh
      //    WHERE uwlh.uid = '${uid}'
      const now = new Date();
      const period = await modules.getTitlesPeriod(now);
      const next = {
        "next_god_date":period.end,
        "next_period_date":{
          "begin": period.date,
          "end": period.end
        }
      };

      const wins = await db.sequelize.query(
        `
          SELECT  this_month_win_rate as win_rate, 
                  this_month_win_bets as win_bets, 
                  this_week_win_bets as first_week_win_bets, 
                  this_period_win_bets as two_week_win_bets
            FROM  users__win__lists WHERE uid = $uid
        `,
        {
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      // const rtype = await db.sequelize.query(
      //   `
      //     SELECT * FROM users__win__lists_histories
      //   `,
      //   {
      //     type: db.sequelize.QueryTypes.SELECT
      //   }
      // );

      const rewards = await db.sequelize.query(
        `
          SELECT 
              sum(case rank_id when '1' then 1 else 0 END) AS diamond, 
              sum(case rank_id when '2' then 1 else 0 END) AS gold, 
              sum(case rank_id when '3' then 1 else 0 END) AS silver, 
              sum(case rank_id when '4' then 1 else 0 END) AS copper
            FROM user__honor__boards
           WHERE uid = $uid
        `,
        {
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      const event = await db.sequelize.query(
        `
          SELECT hb.honor_id, hb.rank_id, hb.updatedAt, ml.name as name, ml.name_ch as name_ch, hb.period as period, r.name as rank_name
          FROM user__honor__boards hb, match__leagues ml, user__ranks r
         WHERE hb.uid = $uid
           AND hb.league_id = ml.league_id
           AND hb.rank_id = r.rank_id
       `,
        {
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        }
      );



      const honorList = {
        next: next,
        wins: wins,
 
        rewards: rewards,
        event: event
      };

      resolve(honorList);
    } catch (err) {
      console.log('Error in  user/honor by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = honorModel;
