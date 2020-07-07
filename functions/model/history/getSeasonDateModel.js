const db = require('../../util/dbUtil');

async function getSeasonDate(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await queryForSeasonDate(args);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

function queryForSeasonDate(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
          SELECT season.league_name AS league_name, season.start_date AS season_start_date, season.end_date AS season_end_date
						FROM matches AS game,
						     match__seasons AS season
					 WHERE game.bets_id = :id
					   AND season.league_id = game.ori_league_id
         )`,
        {
          replacements: {
            id: args.eventID
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
module.exports = getSeasonDate;
