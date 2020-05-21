const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
async function teams(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const teams = await queryAllTeams(args);
      const result = await repackage(teams);
      resolve(result);
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

async function repackage(teams) {
  try {
    const data = [];
    for (let i = 0; i < teams.length; i++) {
      const ele = teams[i];
      const temp = {
        name: ele.name.split('(')[0].trim(),
        name_ch: ele.name_ch,
        groups: ele.groups,
        team_id: ele.team_id
      };
      data.push(temp);
    }
    return data;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = teams;
