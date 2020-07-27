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
        const period = await modules.getTitlesNextPeriod(now, 'YYYY-MM-DD');
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
            SELECT  vl.name, 
                    uwl.this_period_win_rate,
                    uwl.this_period_win_bets,
                    uwl.this_month_win_rate,
                    uwl.this_month_win_bets,
                    this_week1_of_period_correct_counts,
                    this_period_correct_counts,
                    (
                      SELECT COUNT(*)
                        FROM users__win__lists l1, users u
                       WHERE l1.uid = u.uid
                         AND l1.this_month_win_rate >= uwl.this_month_win_rate
                         AND league_id = $league_id
                         AND status in (1, 2)
                       ORDER BY this_month_win_rate DESC
                    ) rate_rank,
                    (
                      SELECT COUNT(*)
                        FROM users__win__lists l1, users u
                       WHERE l1.uid = u.uid
                         AND l1.this_month_win_bets >= uwl.this_month_win_bets
                         AND league_id = $league_id
                         AND status in (1, 2)
                       ORDER BY this_month_win_bets DESC
                    ) bets_rank
              FROM  users__win__lists uwl, view__leagues vl 
             WHERE  uwl.uid = $uid
               AND  vl.league_id = uwl.league_id
               AND  uwl.league_id = $league_id
          `,
          {
            bind: { uid: uid, league_id: league_id, current_period: period.period, currentMonth: currentMonth, currentSeason: currentSeason },
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
