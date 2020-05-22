const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function teams(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teams = await queryAllTeams(args);
      resolve(teams);
    } catch (err) {
      reject(err);
    }
  });
}

function queryAllTeams(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
           SELECT name, name_ch, groups, team_id
             FROM match__teams teams
            WHERE teams.league_id = '${
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
module.exports = teams;
