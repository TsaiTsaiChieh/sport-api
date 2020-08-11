const modules = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil.js');
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
                    this_week1_of_period_correct_counts + this_week1_of_period_fault_counts this_week1_of_period_correct_counts,
                    this_period_correct_counts + this_period_fault_counts this_period_correct_counts,
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
        const rewards = await db.sequelize.query(`
          SELECT rank1_count AS diamond, 
                 rank2_count AS gold, 
                 rank3_count AS silver, 
                 rank4_count AS copper
            FROM users
           WHERE uid = :uid
        `, {
          replacements: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });

        const event = await db.sequelize.query(`
          SELECT distinct titles.id, titles.period, 
                 titles.rank_id, ur.name as rank_name, titles.updatedAt,
                 ml.name
            FROM titles, user__ranks ur, match__leagues ml
           WHERE titles.uid = :uid
             AND titles.league_id = ml.league_id
             AND titles.rank_id = ur.rank_id
           order by period desc, rank_id
        `, {
          replacements: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });

        for (const [index, data] of Object.entries(event)) {
          event[index].name_ch = leagueCodebook(data.name).name_ch;
        };

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
