const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function buyModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = args;
      const buy = await db.sequelize.query(
        `
        SELECT * ,
        IF(p.match_scheduled>0, 1, 0) STATUS
        FROM buys b, ranks r, user__predictions p
        WHERE b.god_rank = r.rank_id
        AND b.uid = p.uid
       `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      console.log(uid);
      resolve(buy);
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = buyModel;
