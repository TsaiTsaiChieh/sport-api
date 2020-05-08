const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function buyModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = args.begin;
      const end = args.end;

      const buy = await db.sequelize.query(
        `
    
          SELECT 
                  b.buy_id,
                  b.updatedAt AS DATE, 
                  u.uid, 
                  u.name AS god_name, 
                  u.avatar, 
                  r.price, 
                  ml.name_ch,
                  b.season,
                  b.day_of_year,
                  (
                    SELECT SUM(uwlh.win_bets)
                      FROM users__win__lists__histories uwlh
                     WHERE uwlh.uid = $uid
                       AND uwlh.league_id = b.league_id
                       AND uwlh.season = b.season
                       AND uwlh.day_of_year = b.day_of_year
                  ) win_bets
            FROM  user__buys b, 
                  users u, 
                  user__ranks r, 
                  match__leagues ml,
                  matches m
            WHERE b.god_id=u.uid 
              AND b.league_id = ml.league_id
              AND r.rank_id = b.god_rank 
              
            GROUP BY
                  b.buy_id,
                  b.updatedAt, 
                  b.uid, 
                  u.name, 
                  u.avatar, 
                  r.price, 
                  ml.name_ch
       `,
        {
          bind: { uid: uid, begin: begin, end: end },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      resolve(buy);
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = buyModel;
