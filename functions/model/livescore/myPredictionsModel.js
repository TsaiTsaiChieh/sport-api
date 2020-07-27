const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const { SCHEDULED, INPLAY, END } = leagueUtil.MATCH_STATUS;
const SoccerID = ['22000', '8']; // 電競足球運動足球
const spreadOption = ['home', 'away'];
const totalsOption = ['under'];

function myPredictions(args) {
  return new Promise(async function(resolve, reject) {
    try {
      args.begin = modules.convertTimezone(args.today);
      args.end = modules.convertTimezone(args.today, { op: 'add', value: 1, unit: 'days' }) - 1;
      const predictions = await getUserTodayPredictionsInformation(args);
      return resolve(repackageData(args, predictions));
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
        // index is range(user__predictions); eq_ref(matches-game); ref(match__leagues-league); eq_ref(match_teams-home); eq_ref(match_team-away); eq_ref(match_spreads-spread1), eq_ref(match_spreads-spread2), eq_ref(match__totals-totals), taking 170ms
        `SELECT game.bets_id, game.status, game.scheduled, game.ori_league_id, game.league_id, game.ori_league_id, game.sport_id, game.home_id, game.away_id, game.spread_id, game.totals_id, game.home_points, game.away_points, 
                home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch, home.image_id AS home_image_id,
                away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch, away.image_id AS away_image_id, 
                spread1.handicap AS spread_handicap, spread1.home_tw, spread1.away_tw,
                totals.totals_id, totals.handicap AS totals_handicap, totals.over_tw,
                league.ori_league_id, league.name_ch, 
                prediction.spread_option, prediction.spread_id AS user_predict_spread_id, prediction.totals_option, prediction.totals_id AS user_predict_totals_id
           FROM user__predictions AS prediction
     INNER JOIN matches AS game ON game.bets_id = prediction.bets_id
     INNER JOIN match__teams AS home ON game.home_id = home.team_id
     INNER JOIN match__teams AS away ON game.away_id = away.team_id
     INNER JOIN match__spreads AS spread1 ON (game.bets_id = spread1.match_id AND game.spread_id = spread1.spread_id)
      LEFT JOIN match__spreads AS spread2 ON  (prediction.bets_id = spread2.match_id AND prediction.spread_id = spread2.spread_id)
      LEFT JOIN match__totals AS totals ON (prediction.bets_id = totals.match_id AND prediction.totals_id = totals.totals_id)
     INNER JOIN match__leagues AS league ON game.ori_league_id = league.ori_league_id
          WHERE prediction.uid = :uid
            AND prediction.league_id = ':league_id'
            AND prediction.match_scheduled BETWEEN ${args.begin} AND ${args.end}
       ORDER BY game.scheduled`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { uid: args.uid, league_id: leagueUtil.leagueCodebook(args.league).id },
          raw: true
        });
      return resolve(result);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageData(args, predictions) {
  try {
    const data = {
      scheduled: [],
      inplay: [],
      end: []
    };
    for (let i = 0; i < predictions.length; i++) {
      const ele = predictions[i];
      let temp = {
        match: {
          id: ele.bets_id,
          scheduled: ele.scheduled,
          scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'hh:mm A' }),
          status: ele.status,
          league_id: ele.league_id,
          league: leagueUtil.leagueDecoder(ele.league_id),
          ori_league: ele.name_ch,
          sport: leagueUtil.league2Sport(args.league).sport
        },
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
          newest_id: ele.spread_id,
          handicap: ele.spread_handicap,
          home_tw: ele.home_tw,
          away_tw: ele.away_tw,
          user_predict_id: ele.user_predict_spread_id,
          user_predict: ele.spread_option
        },
        totals: {
          newest_id: ele.totals_id,
          handicap: ele.totals_handicap,
          over_tw: ele.over_tw,
          user_predict_id: ele.user_predict_totals_id,
          user_predict: ele.totals_option
        }

      };
      temp = reverseHandicap(temp);
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

// 當使用者押注和開盤方向不同時，台盤顯示要變號
// 而 1. 無 ± 的台盤或 2. 足球和電競足球的盤口不用變號，則不用做任何處理
function reverseHandicap(temp) {
  if (temp.league_id === SoccerID[0] || temp.league_id === SoccerID[1]) {
    return temp;
  } else {
    // spread reverse
    const { spread } = temp;
    // indexOf function will return -1 when no element not in the string
    if (spread.home_tw) {
      const homeNegativeSign = spread.home_tw.indexOf('-');
      const homePositiveSign = spread.home_tw.indexOf('+');
      if (spread.home_tw && (homeNegativeSign > 0 || homePositiveSign > 0) && spread.user_predict === spreadOption[1]) {
        if (homeNegativeSign > 0) spread.home_tw = spread.home_tw.replace('-', '+');
        if (homePositiveSign > 0) spread.home_tw = spread.home_tw.replace('+', '-');
      }
    }
    if (spread.away_tw) {
      const awayNegativeSign = spread.away_tw.indexOf('-');
      const awayPositiveSign = spread.away_tw.indexOf('+');
      if (spread.away_tw && (awayNegativeSign > 0 || awayPositiveSign > 0) && spread.user_predict === spreadOption[0]) {
        if (awayNegativeSign > 0) spread.away_tw = spread.away_tw.replace('-', '+');
        if (awayPositiveSign > 0) spread.away_tw = spread.away_tw.replace('+', '-');
      }
    }
    // totals reverse
    const { totals } = temp;
    if (totals.over_tw) {
      const overNegativeSign = totals.over_tw.indexOf('-');
      const overPositiveSign = totals.over_tw.indexOf('+');
      if (totals.over_tw && (overNegativeSign > 0 || overPositiveSign > 0) && totals.user_predict === totalsOption[0]) {
        if (overNegativeSign > 0) totals.over_tw = totals.over_tw.replace('-', '+');
        if (overPositiveSign > 0) totals.over_tw = totals.over_tw.replace('+', '-');
      }
    }
    return temp;
  } // else end
}

module.exports = myPredictions;
