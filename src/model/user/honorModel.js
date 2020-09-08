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
        const period = await modules.getTitlesPeriod(now);

        const next = {
          next_god_date: modules.convertGTM0UnixToDateYMD(period.periodEndDateEndUnix + 1, { format: 'YYYY-MM-DD' }),
          next_period_date: {
            begin: period.date,
            end: period.end
          }
        };
        const wins = {};

        /* 本期 */
        wins[period.period] = await db.sequelize.query(
          `
            SELECT  vl.name,
            uwl.this_period_win_rate,
            uwl.this_period_win_bets,
            this_week1_of_period_correct_counts + this_week1_of_period_fault_counts this_week1_of_period_correct_counts,
            this_period_correct_counts + this_period_fault_counts this_period_correct_counts,
                    (
                      SELECT COUNT(*)
                        FROM users__win__lists l1, users u
                      WHERE l1.uid = u.uid
                        AND l1.this_period_win_rate > uwl.this_period_win_rate
                        AND league_id = :league_id
                        AND status in (1, 2)
                        AND (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) >= god_limits.first_week_win_handicap
                      ORDER BY l1.this_period_win_rate desc, l1.this_period_win_bets desc, (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) DESC
                    ) rate_rank,
                    (
                      SELECT COUNT(*)
                        FROM users__win__lists l1, users u
                      WHERE l1.uid = u.uid
                        AND l1.this_period_win_bets > uwl.this_period_win_bets
                        AND league_id = :league_id
                        AND status in (1, 2)
                        AND (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) >= god_limits.first_week_win_handicap
                      ORDER BY l1.this_period_win_bets desc, l1.this_period_win_rate desc, (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) DESC
                    ) bets_rank
              FROM  users__win__lists uwl, view__leagues vl, god_limits
            WHERE  uwl.uid = :uid
              AND  vl.league_id = uwl.league_id
              AND  god_limits.league_id=uwl.league_id
              and  god_limits.period = :period
              AND  uwl.league_id = :league_id
          `,
          {
            replacements: { uid: uid, league_id: league_id, period: period.period },
            type: db.sequelize.QueryTypes.SELECT,
            logging: true
          }
        );

        /* 上期 */
        wins[period.period - 1] = await db.sequelize.query(
          `
          SELECT  vl.name,
          uwl.this_period_win_rate,
          uwl.this_period_win_bets,
          this_week1_of_period_correct_counts + this_week1_of_period_fault_counts this_week1_of_period_correct_counts,
          this_period_correct_counts + this_period_fault_counts this_period_correct_counts,
                  (
                    SELECT COUNT(*)+1
                      FROM users__win__lists l1, users u
                    WHERE l1.uid = u.uid
                      AND l1.this_period_win_rate > uwl.this_period_win_rate
                      AND league_id = :league_id
                      AND status in (1, 2)
                      AND (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) >= god_limits.first_week_win_handicap
                    ORDER BY l1.this_period_win_rate desc, l1.this_period_win_bets desc, (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) DESC
                  ) rate_rank,
                  (
                    SELECT COUNT(*)+1
                      FROM users__win__lists l1, users u
                    WHERE l1.uid = u.uid
                      AND l1.this_period_win_bets > uwl.this_period_win_bets
                      AND league_id = :league_id
                      AND status in (1, 2)
                      AND (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) >= god_limits.first_week_win_handicap
                    ORDER BY l1.this_period_win_bets desc, l1.this_period_win_rate desc, (l1.this_week1_of_period_correct_counts + l1.this_week1_of_period_fault_counts) DESC
                  ) bets_rank
            FROM  users__win__lists uwl, view__leagues vl, god_limits
          WHERE  uwl.uid = :uid
            AND  vl.league_id = uwl.league_id
            AND  god_limits.league_id=uwl.league_id
            and  god_limits.period = :period
            AND  uwl.league_id = :league_id
          `,
          {
            replacements: { uid: uid, league_id: league_id, period: period.period },
            type: db.sequelize.QueryTypes.SELECT
          }
        );

        // 取出這期大神-聯盟-本期第一周和本期盤數
        const godLeagueLimit = await db.sequelize.query(`
          select league_id, first_week_win_handicap, this_period_win_handicap
            from god_limits
           where period = :period
        `, {
          replacements: {
            period: period.period
          },
          type: db.sequelize.QueryTypes.SELECT
        });
        next.limit = godLeagueLimit;

        const honorList = {
          next: next,
          wins: wins
        };
        resolve(honorList);
      } else if (type === 'record') {
        // users 本來就有計算 rank count 相關資料
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

        // titles 已經有記錄 使用者 各聯盟 鑽金銀銅大神，可以直接取得
        // 取得真正聯盟 name_ch 不是直接從 matc__leagues
        const event = await db.sequelize.query(`
          SELECT distinct titles.id, titles.period,
                 titles.rank_id, ur.name as rank_name, titles.updatedAt,
                 titles.league_id, ml.name
            FROM titles, user__ranks ur, match__leagues ml
           WHERE titles.uid = :uid
             AND titles.league_id = ml.league_id
             AND titles.rank_id = ur.rank_id
           order by period desc, rank_id
        `, {
          replacements: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });

        // 取得真正聯盟 name_ch 從 leagueCodebook
        for (const [index, data] of Object.entries(event)) {
          event[index].name_ch = leagueCodebook(data.name).name_ch;
        };

        resolve({
          rewards: rewards,
          event: event
        });
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
