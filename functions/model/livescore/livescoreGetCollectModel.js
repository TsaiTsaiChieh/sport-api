const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await reResult(args.league, args.token);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(league, token) {
  const result = await repackage(league, token);

  return await Promise.all(result);
}
async function repackage(league, token) {
  let leagueID = modules.leagueCodebook(league).id;

  const mysqlUser = await db.sequelize.query(
    `
      SELECT *
        FROM user__collections
       WHERE uid = '${token.uid}' and
       league_id = '${leagueID}'
     `,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return mysqlUser;
}
module.exports = livescore;
