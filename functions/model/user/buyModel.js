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
        SELECT * FROM(
          SELECT 
                  b.buy_id,
                  b.updatedAt AS DATE, 
                  u.uid, 
                  u.name AS god_name, 
                  u.avatar, 
                  r.price, 
                  ml.name_ch,
                  SUM(uwlh.win_bets) AS win_bets
            FROM  user__buys b, 
                  users u, 
                  user__ranks r, 
                  match__leagues ml, 
                  users__win__lists__histories uwlh
            WHERE b.god_id=u.uid 
              AND b.league_id = ml.league_id
              AND r.rank_id = b.god_rank 
              AND uwlh.uid=b.uid
            GROUP BY
                  b.buy_id,
                  b.updatedAt, 
                  u.uid, 
                  u.name, 
                  u.avatar, 
                  r.price, 
                  ml.name_ch
          ) dd
          LEFT JOIN user_buy_logs ubl ON ubl.buy_id = dd.buy_id
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
function repackage(data) {

}
module.exports = buyModel;
