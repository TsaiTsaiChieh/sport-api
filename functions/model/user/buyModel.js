const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
function buyModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const buyList = [];
      const begin = args.begin;
      const end = args.end;

      const buy = await db.sequelize.query(
        `
          SELECT * FROM user__buys
        `,
        {
          bind: { uid: uid, begin: begin, end: end },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      buy.forEach(function(ele) { // 這裡有順序性
        dbEngine.getGodSellPredictionWinBetsInfo(ele.god_uid, ele.league_id, ele.matches_date);
      });

      resolve(buyList);
    } catch (err) {
      console.log('Error in  user/buy by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = buyModel;
