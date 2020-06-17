const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const TWO_WEEKS = 14;
/*
* 1. 檢查該使用者存在與否
* possible used table: user__predictions, matches, match__teams, match__spreads, match__totals, users
*/

async function predictionHistory(args) {
  let err, userData, historyData;
  [err, userData] = await modules.to(dbEngine.findUser(args.uid));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  [err, historyData] = await modules.to(getUserPredictionData(args, userData));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  [err] = await modules.to(repackageReturnData(args, historyData));
}

async function getUserPredictionData(args, userData) {
  const begin = modules.moment(args.now).unix();
  const beforeDate = modules.convertTimezoneFormat(begin, { op: 'subtract', value: TWO_WEEKS, unit: 'days' });
  const before = modules.convertTimezone(beforeDate);

  const [err, results] = await modules.to(db.sequelize.query(
    // index is ref (user__predictions); eq_ref (matches); eq_ref (matches__teams[home]); eq_ref (matches__teams[away]); ref (match__spreads); ref (match__totals), taking 165ms
    `SELECT game.bets_id, game.league_id, game.sport_id, game.scheduled, game.home_points, game.away_points, 
            prediction.sell, prediction.match_date, prediction.spread_id, prediction.spread_option, prediction.spread_bets, prediction.spread_result, prediction.spread_result_flag, 
            prediction.user_status, prediction.totals_id, prediction.totals_option, prediction.totals_bets, prediction.totals_result, prediction.totals_result_flag, 
            spread.handicap AS spread_handicap, spread.home_tw, spread.away_tw, 
            totals.handicap AS totals_handicap, totals.over_tw
       FROM user__predictions AS prediction
 INNER JOIN matches AS game
         ON game.bets_id = prediction.bets_id
 INNER JOIN match__teams AS home
         ON game.home_id = home.team_id
 INNER JOIN match__teams AS away
         ON game.away_id = away.team_id
 INNER JOIN match__spreads AS spread
         ON spread.spread_id = prediction.spread_id
 INNER JOIN match__totals AS totals
         ON totals.totals_id = prediction.totals_id
      WHERE prediction.uid = '${userData.uid}'
        AND game.scheduled BETWEEN ${before} and ${begin}
        AND game.status = ${modules.MATCH_STATUS.END}
        AND game.flag_prematch = ${modules.MATCH_STATUS.VALID};`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }));

  if (err) throw new AppErrors.MysqlError(`${err.stack} by TsaiChieh`);
  return results;
}

async function repackageReturnData(args, historyData) {
  // historyData is a object, groupBy function can group by property which league_id
  // ex: [ [{NBA Data}, {NBA Data}, {NBA Data}] , [{eSoccer Data}, {eSoccer Data},... ] ] two layers
  const temp = [];
  const groupByLeague = modules.groupBy(historyData, 'league_id');
  for (const i in groupByLeague) {
    for (const j in groupByLeague[i]) {
      temp.push(repackagePastPredictionData(args, groupByLeague[i][j]));
    }
  }
}

async function repackagePastPredictionData(args, ele) {
  const data = {
    match_id: ele.bets_id,
    match_date: modules.convertTimezoneFormat(ele.scheduled, { format: 'M/D' }),
    league_id: ele.league_id,
    sport_id: ele.sport_id,
    scheduled: ele.scheduled,
    scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'hh:mm A' })
  };
  console.log(data);
}
module.exports = predictionHistory;
