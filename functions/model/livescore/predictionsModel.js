const modules = require('../../util/modules');
// const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function predictions(args) {
  try {
    const result = await db.sequelize.query(
      `SELECT *
         FROM matches
        WHERE league_id = '${modules.leagueCodebook(args.league).id}'`,
      {
        type: db.sequelize.QueryTypes.SELECT
      });
    return Promise.resolve(result);
  } catch (err) {
    console.log(err);
  }
}
module.exports = predictions;
