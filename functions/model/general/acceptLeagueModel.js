const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function acceptLeague() {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await repackage(modules.acceptLeague);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

async function repackage(acceptLeague) {
  try {
    const result = [];
    for (let i = 0; i < acceptLeague.length; i++) {
      const leagueFlag = await queryEvent(acceptLeague[i]);
      if (leagueFlag.length > 0) {
        result.push(acceptLeague[i]);
      }
    }

    return acceptLeague;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

async function queryEvent(leagueID, date1, date2) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        `
				 SELECT game.bets_id AS bets_id, game.scheduled AS scheduled, game.status AS status
					 FROM matches AS game			      
					WHERE (game.status = ${modules.MATCH_STATUS.SCHEDULED} OR game.status = ${modules.MATCH_STATUS.INPLAY} OR game.status = ${modules.MATCH_STATUS.END})
						AND game.league_id = ${leagueID}
						AND game.scheduled BETWEEN ${date1} AND ${date2}
			 `,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(
        new AppErrors.MysqlError(`${err} at checkmatch_another by DY`)
      );
    }
  });
}
module.exports = acceptLeague;
