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
        SELECT b.buy_id, b.uid, b.createdAt, ml.name_ch, r.price FROM user__buys b, match__leagues ml, user__ranks r
         WHERE b.league_id = ml.league_id
           AND b.god_rank = r.rank_id
           AND b.uid = uwl.uid
           AND b.uid = $uid
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
