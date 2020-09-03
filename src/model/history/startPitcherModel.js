// const leagueUtil = require('../../util/leagueUtil');
// const db = require('../../util/dbUtil');
// const AppErrors = require('../../util/AppErrors');

async function startPitcher(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // const data = await queryEvents(args);
      // resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

// async function queryEvents(args) {
//  return new Promise(async function(resolve, reject) {
//    try {
//      const queries = await db.sequelize.query(
//        // take 169 ms
//        `(
//          SELECT historygame.bets_id AS id, historygame.scheduled AS scheduled, historygame.home_id AS history_home_id, historygame.away_id AS history_away_id, historygame.home_points AS history_home_points, historygame.away_points AS history_away_points,
//                 game.away_id AS aim_away_id,game.home_id AS aim_home_id
//            FROM matches AS game,
//                 matches AS historygame,
//                 match__seasons AS season
//           WHERE game.bets_id = :event_id
//             AND historygame.status = ${leagueUtil.MATCH_STATUS.END}
//             AND game.league_id = :leagueID
//						 AND season.league_id = :leagueID
//						 AND season.current = 1
//             AND (game.home_id = historygame.home_id OR game.home_id = historygame.away_id)
//             AND historygame.scheduled BETWEEN UNIX_TIMESTAMP(season.start_date) AND (UNIX_TIMESTAMP(season.end_date)+86400)
//        ORDER BY historygame.scheduled
//        )`,
//        {
//          replacements: {
//            leagueID: leagueUtil.leagueCodebook(args.league).id,
//            event_id: args.event_id
//          },
//          type: db.sequelize.QueryTypes.SELECT
//        }
//      );

//      return resolve(queries);
//    } catch (err) {
//      return reject(`${err.stack} by DY`);
//    }
//  });
// }

module.exports = startPitcher;
