const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const allCollections = await queryAllCollection(args);
      console.log(allCollections);

      const result = await repackage(args, allCollections);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}

function queryAllCollection(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.date);
      const end =
        modules.convertTimezone(args.date, {
          op: 'add',
          value: 1,
          unit: 'days'
        }) - 1;

      const queries = await db.sequelize.query(
        `
            SELECT collections.bets_id, collections.scheduled,
                   matches.home_id, matches.away_id, matches.spread_id,
                   teams.name, 
                   spreads.spread_id
              FROM user__collections collections
            INNER JOIN matches
              on collections.bets_id = matches.bets_id
            LEFT JOIN match__teams teams
              on matches.home_id = teams.team_id 
            LEFT JOIN match__spreads spreads
              on matches.spread_id = spreads.spread_id
             WHERE collections.uid = '${args.token.uid}' and
                   collections.league_id = '${
                     modules.leagueCodebook(args.league).id
                   }'  and
                   collections.scheduled >= '${begin}'   and
                   collections.scheduled <= '${end}'
           `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await Promise.all(queries));
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, allCollections) {}
module.exports = livescore;
