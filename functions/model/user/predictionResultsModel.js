const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const UNSETTLEMENT = -2;

function predictionResult(args) {
  return new Promise(async function (resolve, reject) {
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
      const a = repackage(predictions);
      console.log('這裏---', a);
      return resolve(a);
      // return resolve(repackage(predictions));
    } catch (err) {}
  });
}

// 尋找已結算的預測單
function queryUserPredictionWhichIsSettled(args, unix) {
  return new Promise(async function (resolve, reject) {
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
    const data = {};
    // const a = modules.groupBy(predictions, 'league');
    // a.forEach(function (data) {
    //   console.log(data);
    // });

    for (let i = 0; i < predictions.length; i++) {
      const ele = predictions[i];
      console.log(ele);

      data[ele.league].push('ss');
    }
    console.log('--', data);

    return data;
  } catch (err) {
    console.log('---?????', err);
  }
}
module.exports = predictionResult;
