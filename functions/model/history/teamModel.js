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
           SELECT name, name_ch, groups, team_id, alias_ch
             FROM match__teams teams
            WHERE teams.league_id = :leagueID
         )`,
        {
          replacements: {
            leagueID: modules.leagueCodebook(args.league).id
          },
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
      if (!ele.alias_ch) {
        ele.alias_ch = ele.name_ch;
      }

      const temp = {
        name: ele.name.split('(')[0].trim(),
        name_ch:
          ele.alias_ch.indexOf('(') >= 0
            ? ele.alias_ch.split('(')[0].trim()
            : ele.alias_ch.trim(),
        player_name:
          ele.alias_ch.indexOf('(') >= 0
            ? ele.alias_ch.split('(')[1].replace(')', '').trim()
            : null,
        groups: ele.groups,
        team_id: ele.team_id
      };
      data.push(temp);
    }
    const result = await data.sort(function(a, b) {
      return a.name > b.name ? 1 : -1;
    });
    const temp = [];
    let count = -1;
    let lastTeam = '';
    for (let i = 0; i < result.length; i++) {
      if (result[i].name === lastTeam) {
        temp[count].push(result[i]);
      } else {
        count = count + 1;
        temp[count] = [];
        temp[count].push(result[i]);
      }
      lastTeam = result[i].name;
    }
    return temp;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = teams;
