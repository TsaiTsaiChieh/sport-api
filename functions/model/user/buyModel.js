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
        SELECT * FROM (
          SELECT b.buy_id, b.league_id, uwl.this_month_win_rate FROM user__buys b, user__ranks r, user__predictions up, users u, match__leagues ml, users__win__lists uwl
           WHERE b.god_id= up.uid
             AND uwl.league_id = ml.league_id
             AND b.league_id = uwl.league_id
             AND b.uid = u.uid
             AND b.god_rank = r.rank_id
             AND b.uid = $uid
             AND b.updatedAt
             BETWEEN $begin
             AND $end
        ) groups
        GROUP BY b.buy_id, b.league_id, uwl.this_month_win_rate
        
       `,
        {
          bind:{ uid:uid, begin:begin, end:end },
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
