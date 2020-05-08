const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function honorModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = req.body.uid;
      const type = req.body.type;
      const league_id = req.body.league_id;
      if (type === 'performance') {
        const now = new Date();
        const period = await modules.getTitlesPeriod(now, 'YYYY-MM-DD').period;
        const currentSeason = modules.moment().year();
        const currentMonth = modules.moment().month();

        const next = {
          next_god_date: period.end,
          next_period_date: {
            begin: period.date,
            end: period.end
          }
        };


        const wins = await db.sequelize.query(
          `
            SELECT  ml.name, 
                    ml.name_ch,
                    uwl.this_period_win_rate,
                    uwl.this_month_win_rate,
                    uwl.this_month_win_bets,
                    (
                      SELECT SUM(correct_counts+fault_counts) as lose
                        FROM users__win__lists__histories
                       WHERE uid = $uid
                         AND league_id = $league_id
                     
                         AND period = $current_period
                         AND month = $currentMonth
                         AND season = $currentSeason
                    ) first_week_win_handicap,
                    (
                      SELECT SUM(correct_counts+fault_counts) as lose
                        FROM users__win__lists__histories
                       WHERE uid = $uid
                         AND league_id = $league_id
                         AND period = $current_period
                         AND month = $currentMonth
                         AND season = $currentSeason
                    ) this_period_win_handicap,
                    (
                      SELECT COUNT(*) 
                        FROM users__win__lists l1 
                       WHERE l1.this_month_win_rate >= uwl.this_month_win_rate
                    ) rate_rank,
                    (
                      SELECT COUNT(*) 
                        FROM users__win__lists l1 
                       WHERE l1.this_month_win_bets >= uwl.this_month_win_bets
                    ) bets_rank
                    
              FROM  users__win__lists uwl, match__leagues ml 
             WHERE  uwl.uid = $uid
               AND  ml.league_id = uwl.league_id
               AND  uwl.league_id = $league_id
          `,
          {
            bind: { uid: uid, league_id:league_id, current_period:period, currentMonth:currentMonth, currentSeason:currentSeason },
            type: db.sequelize.QueryTypes.SELECT
          }
        );

        const honorList = {
          next: next,
          wins: wins
        };
        resolve(honorList);
      } else if (type === 'record') {
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
          rewards: rewards,
          event: event
        };
        resolve(honorList);
      } else {
        console.log("you don't input have any type.");
      }
    } catch (err) {
      console.log('Error in  user/honor by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = honorModel;
