const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');
const db = require('../../util/dbUtil');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const allCollections = await queryAllCollection(args);
      // const result = await repackage(args, allCollections);

      resolve(allCollections);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}

function queryAllCollection(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
        modules.convertTimezone(args.date, {
          op: 'add',
          value: 1,
          unit: 'days'
        }) - 1;

      const queries = await db.sequelize.query(
        `(
            SELECT collections.bets_id AS id
              FROM user__collections AS collections
             WHERE collections.uid = :uid
               AND collections.league_id = :leagueID
               AND collections.scheduled BETWEEN :begin AND :end
          )
           `,
        {
          replacements: {
            leagueID: leagueUtil.leagueCodebook(args.league).id,
            uid: args.token.uid,
            begin: begin,
            end: end
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await Promise.all(queries));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

module.exports = livescore;
