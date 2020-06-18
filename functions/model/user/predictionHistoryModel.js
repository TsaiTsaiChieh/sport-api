const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const TWO_WEEKS = 14;
const settlement = {
  loss: -1,
  lossHalf: -0.5,
  fair: 0,
  win: 1,
  winHalf: 0.5,
  abnormal: -2
};
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
  args.begin = modules.moment(args.now).unix();
  const beforeDate = modules.convertTimezoneFormat(args.begin, { op: 'subtract', value: TWO_WEEKS, unit: 'days' });
  // before will be 00:00:00 GMT+0800
  args.before = modules.convertTimezone(beforeDate);

  const [err, results] = await modules.to(db.sequelize.query(
    // index is ref (user__predictions); eq_ref (matches); eq_ref (matches__teams[home]); eq_ref (matches__teams[away]); ref (match__spreads); ref (match__totals), taking 165ms
    `SELECT game.bets_id, game.league_id, game.sport_id, game.scheduled, game.home_points, game.away_points, 
            home.team_id AS home_id, home.image_id AS home_image_id, home.name AS home_name, home.name_ch AS home_name_ch, home.alias AS home_alias, home.alias_ch AS home_alias_ch,
            away.team_id AS away_id, away.image_id AS away_image_id, away.name AS away_name, away.name_ch AS away_name_ch, away.alias AS away_alias, away.alias_ch AS away_alias_ch,
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
        AND game.scheduled BETWEEN ${args.before} and ${args.begin}
        AND game.status = ${modules.MATCH_STATUS.END}
        AND game.flag_prematch = ${modules.MATCH_STATUS.VALID};`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }));

  if (err) throw new AppErrors.MysqlError(`${err.stack} by TsaiChieh`);
  return results;
}

async function repackageReturnData(args, historyData) {
  // groupByLeague is a object, groupBy function can group by property which league_id
  // ex: [ [{NBA Data}, {NBA Data}, {NBA Data}] , [{eSoccer Data}, {eSoccer Data},... ] ] two layers
  const temp = [];
  const groupByLeague = modules.groupBy(historyData, 'league_id');
  console.log('---', groupByLeague[0].length, groupByLeague[1].length, '---');

  // for (const i in groupByLeague) {
  //   for (const j in groupByLeague[i]) {
  //     repackagePastPredictionData(args, groupByLeague[i][j]);
  //   }
  // }
  // for (const i in groupByLeague) {
  //   repackagePastPredictionData(args, groupByLeague[0]);
  // }
  groupByLeague.map(function(eachLeagueItem) { // 3(NBA), 26(eSoccer)
    eachLeagueItem.map(function(match, index) {
      // console.log(match.league_id, index);
      repackagePastPredictionData(args, match);
    });
  });
}

async function repackagePastPredictionData(args, ele) {
  // const matchDate = modules.convertTimezoneFormat(ele.scheduled);
  // // get the match date unix time
  // const matchUnix = modules.convertTimezone(matchDate);
  // let oneDayUnix = args.before;
  // // let i = 0;
  // const pastPredictions = new Array(TWO_WEEKS);
  // do {
  //   // i++;
  //   // console.log(i);

  //   // console.log(matchUnix, oneDayUnix, matchDate);
  //   if (matchUnix !== oneDayUnix) pastPredictions.push([]);
  //   else {
  //     const data = {
  //       match: {
  //         id: ele.bets_id,
  //         date: matchDate,
  //         league_id: ele.league_id,
  //         sport_id: ele.sport_id,
  //         scheduled: ele.scheduled,
  //         scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'hh:mm A' }),
  //         home_points: ele.home_points,
  //         away_points: ele.away_points,
  //         home: {
  //           id: ele.home_id,
  //           team_name: ele.home_name,
  //           player_name: modules.sliceTeamAndPlayer(ele.home_alias).player_name,
  //           alias: modules.sliceTeamAndPlayer(ele.home_alias).team,
  //           alias_ch: ele.home_alias_ch,
  //           name_ch: ele.home_name_ch,
  //           image_id: ele.home_image_id
  //         },
  //         away: {
  //           id: ele.away_id,
  //           team_name: ele.away_name,
  //           player_name: modules.sliceTeamAndPlayer(ele.away_alias).player_name,
  //           alias: modules.sliceTeamAndPlayer(ele.away_alias).team,
  //           alias_ch: ele.away_alias_ch,
  //           name_ch: ele.away_name_ch,
  //           image_id: ele.away_image_id
  //         }
  //       },
  //       predicted: {
  //         sell: ele.sell,
  //         user_status: ele.user_status,
  //         spread: {
  //           id: ele.spread_id,
  //           handicap: ele.spread_handicap,
  //           home_tw: ele.home_tw,
  //           away_tw: ele.away_tw,
  //           option: ele.spread_option,
  //           bets: ele.spread_bets,
  //           result: ele.spread_result,
  //           end: returnSettlement(ele.spread_result_flag)
  //         },
  //         totals: {
  //           id: ele.totals_id,
  //           option: ele.totals_option,
  //           handicap: ele.totals_handicap,
  //           over_tw: ele.over_tw,
  //           bets: ele.totals_bets,
  //           result: ele.totals_result,
  //           end: returnSettlement(ele.totals_result_flag)
  //         }
  //       }
  //     };
  //     pastPredictions.push(data);
  //   }
  //   oneDayUnix = modules.convertTimezone(oneDayUnix, { op: 'add', value: 1, unit: 'days' });
  // } while (args.now < oneDayUnix);
  // return pastPredictions;
}

function returnSettlement(flag) {
  const { loss, lossHalf, fair, win, winHalf, abnormal } = settlement;
  if (flag === abnormal) return abnormal;
  if (flag === win || flag === winHalf) return win;
  if (flag === fair) return fair;
  if (flag === loss || flag === lossHalf) return loss;
}

module.exports = predictionHistory;
