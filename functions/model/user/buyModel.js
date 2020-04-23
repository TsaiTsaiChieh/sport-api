const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function buyModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
        let uid = args;
      const percent = 0.95;
      const buy = await db.sequelize.query(
      `
      SELECT *, (spread_bets+totals_bets)*${percent} bets
        FROM user__predictions up, match__leagues ml
       WHERE up.league_id = ml.league_id
         AND up.sell = 1
         AND up.uid = '${uid}'
       `,
      {
        type: db.sequelize.QueryTypes.SELECT,
      });
      resolve(buy);
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = buyModel;
