const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(args.league, args.token, args.time);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(league, token, time) {
  const result = await repackage(league, token, time);

  return await Promise.all(result);
}
async function repackage(league, token, time) {
  const leagueID = modules.leagueCodebook(league).id;
  const begin = modules.convertTimezone(time);
  const end =
    modules.convertTimezone(time, {
      op: 'add',
      value: 1,
      unit: 'days'
    }) - 1;

  const mysqlUser = await db.sequelize.query(
    `
      SELECT *
        FROM user__collections
       WHERE uid = '${token.uid}' and
       league_id = '${leagueID}'  and
       scheduled >= '${begin}'    and
       scheduled <= '${end}'
     `,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return mysqlUser.bets_id;
}
module.exports = livescore;
