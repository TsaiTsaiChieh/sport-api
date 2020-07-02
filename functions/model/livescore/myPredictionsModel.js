const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

async function myPredictions(args) {
  try {
    args.begin = modules.convertTimezone(args.today);
    args.end = modules.convertTimezone(args.today, { op: 'add', value: 1, unit: 'days' }) - 1;
    const preidctions = await getUserTodayPredictions(args);
    // console.log(begin, today, end);

    // const result = await db.sequelize.query(
    //   `SELECT *
    //      FROM matches
    //     WHERE league_id = '${modules.leagueCodebook(args.league).id}'`,
    //   {
    //     type: db.sequelize.QueryTypes.SELECT
    //   });
    // return Promise.resolve(result);
  } catch (err) {
    console.log(err);
  }
}

function getUserTodayPredictions(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        // index is range(user__predictions); eq_ref(matches-game); eq_ref(match_teams-home); eq_ref(match_team-away); eq_ref(match_spreads-spread), taking 170ms
        `SELECT game.bets_id, game.status, game.scheduled, game.league_id, game.ori_league_id, game.sport_id, game.home_id, game.away_id, game.spread_id, game.home_points, game.away_points, 
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, home.image_id AS home_image_id,
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, away.image_id AS away_image_id, 
                spread.handicap, spread.rate, spread.home_tw, spread.away_tw
           FROM user__predictions AS prediction
     INNER JOIN matches AS game ON game.bets_id = prediction.bets_id
     INNER JOIN match__teams AS home ON game.home_id = home.team_id
     INNER JOIN match__teams AS away ON game.away_id = away.team_id
     INNER JOIN match__spreads AS spread ON (game.bets_id = spread.match_id AND game.spread_id = spread.spread_id)
          WHERE prediction.uid = :uid
            AND prediction.league_id = ':league_id'
            AND prediction.match_scheduled between ${args.begin} and ${args.end}`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { uid: args.uid, league_id: modules.leagueCodebook(args.league).id },
          raw: true
        });
      return resolve(result);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageData(preidctions) {

}
module.exports = myPredictions;
