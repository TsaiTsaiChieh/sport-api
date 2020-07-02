const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const { SCHEDULED, INPLAY, END } = modules.MATCH_STATUS;

function myPredictions(args) {
  return new Promise(async function(resolve, reject) {
    try {
      args.begin = modules.convertTimezone(args.today);
      args.end = modules.convertTimezone(args.today, { op: 'add', value: 1, unit: 'days' }) - 1;
      const predictions = await getUserTodayPredictionsInformation(args);
      return resolve(repackageData(predictions));
    } catch (err) {
      console.log(err);
      return reject({ code: err.code, error: err });
    }
  });
}

function getUserTodayPredictionsInformation(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        // index is range(user__predictions); eq_ref(matches-game); ref(match__leagues-league); eq_ref(match_teams-home); eq_ref(match_team-away); eq_ref(match_spreads-spread), taking 170ms
        `SELECT game.bets_id, game.status, game.scheduled, game.ori_league_id, game.league_id, game.ori_league_id, game.sport_id, game.home_id, game.away_id, game.spread_id, game.home_points, game.away_points, 
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, home.image_id AS home_image_id,
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, away.image_id AS away_image_id, 
                spread.handicap, spread.home_tw, spread.away_tw,
                league.ori_league_id, league.name_ch
           FROM user__predictions AS prediction
     INNER JOIN matches AS game ON game.bets_id = prediction.bets_id
     INNER JOIN match__teams AS home ON game.home_id = home.team_id
     INNER JOIN match__teams AS away ON game.away_id = away.team_id
     INNER JOIN match__spreads AS spread ON (game.bets_id = spread.match_id AND game.spread_id = spread.spread_id)
     INNER JOIN match__leagues AS league ON game.ori_league_id = league.ori_league_id
          WHERE prediction.uid = :uid
            AND prediction.league_id = ':league_id'
            AND prediction.match_scheduled between ${args.begin} and ${args.end}
       ORDER BY game.scheduled`,
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

function repackageData(predictions) {
  try {
    const data = {
      scheduled: [],
      inplay: [],
      end: []
    };
    for (let i = 0; i < predictions.length; i++) {
      const ele = predictions[i];
      const temp = {
        match: {
          id: ele.bets_id,
          scheduled: ele.scheduled,
          scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'hh:mm A' }),
          status: ele.status,
          league: ele.league_id,
          ori_league: ele.name_ch,
          home: {
            id: ele.home_id,
            team_name: ele.home_alias,
            alias: modules.sliceTeamAndPlayer(ele.home_alias).team,
            alias_ch: modules.sliceTeamAndPlayer(ele.home_alias_ch).team,
            player_name: modules.sliceTeamAndPlayer(ele.home_alias).player_name,
            image_id: ele.home_image_id,
            points: ele.home_points || ele.home_points === 0 ? ele.home_points : null
          },
          away: {
            id: ele.away_id,
            team_name: ele.away_alias,
            alias: modules.sliceTeamAndPlayer(ele.away_alias).team,
            alias_ch: modules.sliceTeamAndPlayer(ele.away_alias_ch).team,
            player_name: modules.sliceTeamAndPlayer(ele.away_alias).player_name,
            image_id: ele.away_image_id,
            points: ele.away_points || ele.away_points === 0 ? ele.away_points : null
          },
          spread: {
            id: ele.spread_id,
            handicap: ele.handicap,
            home_tw: ele.home_tw,
            away_tw: ele.away_tw
          }
        }
      };
      if (ele.status === SCHEDULED) data.scheduled.push(temp);
      else if (ele.status === INPLAY) data.inplay.push(temp);
      else if (ele.status === END) data.end.push(temp);
    }
    return data;
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}
module.exports = myPredictions;
