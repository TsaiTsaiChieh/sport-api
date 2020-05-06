const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const UNSETTLEMENT = -2;

function predictionResult(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const unix = {
        begin: modules.convertTimezone(args.date),
        end:
          modules.convertTimezone(args.date, {
            op: 'add',
            value: 1,
            unit: 'days'
          }) - 1
      };
      const predictions = await queryUserPredictionWhichIsSettled(args, unix);
      return resolve(repackage(predictions));
    } catch (err) {}
  });
}

// 尋找已結算的預測單
function queryUserPredictionWhichIsSettled(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is range or eq_ref, taking 161ms
      // TODO index in league table is ALL
      const result = await db.sequelize.query(
        `SELECT prediction.*, 
                spread.handicap AS spread_handicap, spread.home_tw, spread.away_tw, 
                totals.handicap AS totals_handicap, totals.over_tw
           FROM 
                (
                  SELECT DISTINCT prediction.bets_id, prediction.match_scheduled, 
                        league.name AS league, league.league_id,
                        home.team_id AS home_id, home.alias AS home_alias, home.alias_ch AS home_alias_ch, 
                        away.team_id AS away_id, away.alias AS away_alias, away.alias_ch AS away_alias_ch, 
                        prediction.spread_id, prediction.spread_option, prediction.spread_bets, prediction.spread_result_flag, prediction.totals_id, prediction.totals_option,  prediction.totals_bets, prediction.totals_result_flag, 
                        matches.home_points, matches.away_points
                   FROM user__predictions AS prediction,
                        match__leagues AS league,
                        matches, 
                        match__teams AS home, 
                        match__teams AS away 
                  WHERE prediction.league_id = league.league_id
                    AND prediction.bets_id = matches.bets_id 
                    AND matches.home_id = home.team_id 
                    AND matches.away_id = away.team_id 
                    AND prediction.uid = '${args.token.uid}'
                    AND match_scheduled BETWEEN ${unix.begin} AND ${unix.end}
                    AND (spread_result_flag != ${UNSETTLEMENT} OR totals_result_flag != ${UNSETTLEMENT})
                ) 
             AS prediction
      LEFT JOIN match__spreads AS spread ON prediction.spread_id = spread.spread_id
      LEFT JOIN match__totals AS totals ON prediction.totals_id = totals.totals_id`,
        { type: db.sequelize.QueryTypes.SELECT }
      );
      return resolve(result);
    } catch (err) {
      console.error(err);
      return reject(new AppErrors.MysqlError(`${err} by TsaiChieh`));
    }
  });
}

function repackage(predictions) {
  try {
    let temp = [];
    const data = {};
    modules.groupBy(predictions, 'league').forEach(function(groupByData) {
      let league;
      groupByData.forEach(function(ele) {
        // 取出 聯盟陣列中的賽事
        temp.push(repackageMatch(ele));
        league = ele.league;
      });
      data[league] = temp;
      temp = [];
    });
    return data;
  } catch (err) {
    return new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

function repackageMatch(ele) {
  try {
    return {
      id: ele.bets_id,
      scheduled: ele.match_scheduled,
      scheduled_tw: modules
        .moment(ele.match_scheduled * 1000)
        .format('A hh:mm'),
      league_id: ele.league_id,
      league: ele.league,
      home: {
        id: ele.home_id,
        alias: modules.sliceTeamAndPlayer(ele.home_alias).team,
        alias_ch: modules.sliceTeamAndPlayer(ele.home_alias_ch).team,
        player_name: modules.sliceTeamAndPlayer(ele.home_alias).player_name
      },
      away: {
        id: ele.away_id,
        alias: modules.sliceTeamAndPlayer(ele.away_alias).team,
        alias_ch: modules.sliceTeamAndPlayer(ele.away_alias_ch).team,
        player_name: modules.sliceTeamAndPlayer(ele.away_alias).player_name
      },
      spread: {
        id: ele.spread_id ? ele.spread_id : null,
        handicap: ele.spread_handicap ? ele.spread_handicap : null,
        home_tw: ele.home_tw ? ele.home_tw : null,
        away_tw: ele.away_tw ? ele.home_tw : null,
        predict: ele.spread_option ? ele.spread_option : null,
        bets: ele.spread_bets ? ele.spread_bets : null,
        result: ele.spread_option ? ele.spread_result_flag : null
      },
      totals: {
        id: ele.totals_id ? ele.totals_id : null,
        handicap: ele.totals_handicap ? ele.totals_handicap : null,
        over_tw: ele.over_tw ? ele.over_tw : null,
        predict: ele.totals_option ? ele.totals_option : null,
        bets: ele.totals_bets ? ele.totals_bets : null,
        result: ele.totals_option ? ele.totals_result_flag : null
      }
    };
  } catch (err) {
    return new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}
module.exports = predictionResult;
