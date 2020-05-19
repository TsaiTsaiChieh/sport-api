const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function teamHandicap(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teamHandicap = await queryTeamHandicap(args);
      const result = await repackage(args, teamHandicap);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryTeamHandicap(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
           SELECT name, name_ch, groups, team_id
           FROM   match__teams teams
           WHERE  teams.league_id = '${
             modules.leagueCodebook(args.league).id
           }'   
         )`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return resolve(await queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

async function repackage(args, matches) {
  try {
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = teamHandicap;
