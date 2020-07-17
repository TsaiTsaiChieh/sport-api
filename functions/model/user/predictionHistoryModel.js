const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const TWO_WEEKS = 14;
const ONE_DAY_UNIX = modules.convertTimezone(0, { op: 'add', value: 1, unit: 'days' });

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
*    possible used table: user__predictions, matches, match__teams, match__spreads, match__totals, users
* 2. 取得該使用者所有聯盟的已完賽資料
* 3. 重新打包並回傳
*/

async function predictionHistory(args) {
  let err, userData, historyData, historyLogs;
  [err, userData] = await modules.to(dbEngine.findUser(args.uid));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  [err, historyData] = await modules.to(getUserPredictionData(args, userData));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  [err, historyLogs] = await modules.to(repackageReturnData(args, historyData));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  return historyLogs;
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
  const data = {};
  let league; // "data" object property
  // "groupByLeague" is an array which contains many objects,
  // grouped by property which is league_id,
  // this object looks like:
  // [
  //    [ {NBA Data}, {NBA Data}, {NBA Data} ],
  //    [ {eSoccer Data}, {eSoccer Data},... ]
  // ]
  const groupByLeague = modules.groupBy(historyData, 'league_id');
  groupByLeague.map(function(eachLeagueItems) {
    // Create an array, a.k.a "pastPredictions",
    // to save the past prediction data which from no array today to 14 days ago,
    // and each array belongs to each different league.
    const pastPredictions = new Array(TWO_WEEKS);
    for (let i = 0; i < TWO_WEEKS; i++) {
      const tempArray = []; // To save repackage match data temp array
      // "eachLeagueItems" contains each match information,
      // like match id, schedule time, spread id and so on.
      eachLeagueItems.map(async function(match) {
        league = modules.leagueDecoder(match.league_id);
        const matchDate = modules.convertTimezoneFormat(match.scheduled);
        // Get the match date unix time
        const matchUnix = modules.convertTimezone(matchDate);
        const addOneDayUnix = args.before + (i * ONE_DAY_UNIX);
        if (matchUnix === addOneDayUnix) {
          // XXX error handling should be more careful
          const [err, result] = await modules.to(repackageMatchDate(match, matchDate));
          if (err) throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
          tempArray.push(result);
          // tempArray.push(repackageMatchDate(match, matchDate));
        }
      });
      pastPredictions[i] = tempArray;
    }
    // For decreasing date reason so reverse the array
    data[league] = pastPredictions.reverse();
  });
  return data;
}

async function repackageMatchDate(ele, matchDate) {
  const data = {
    match: {
      date: matchDate,
      league_id: ele.league_id,
      id: ele.bets_id,
      sport_id: ele.sport_id,
      scheduled: ele.scheduled,
      scheduled_tw: modules.convertTimezoneFormat(ele.scheduled, { format: 'hh:mm A' }),
      home_points: ele.home_points,
      away_points: ele.away_points,
      home: {
        id: ele.home_id,
        team_name: ele.home_name,
        player_name: modules.sliceTeamAndPlayer(ele.home_alias).player_name,
        alias: modules.sliceTeamAndPlayer(ele.home_alias).team,
        alias_ch: ele.home_alias_ch,
        name_ch: ele.home_name_ch,
        image_id: ele.home_image_id
      },
      away: {
        id: ele.away_id,
        team_name: ele.away_name,
        player_name: modules.sliceTeamAndPlayer(ele.away_alias).player_name,
        alias: modules.sliceTeamAndPlayer(ele.away_alias).team,
        alias_ch: ele.away_alias_ch,
        name_ch: ele.away_name_ch,
        image_id: ele.away_image_id
      }
    },
    predicted: {
      sell: ele.sell,
      user_status: ele.user_status,
      spread: {
        id: ele.spread_id,
        handicap: ele.spread_handicap,
        home_tw: ele.home_tw,
        away_tw: ele.away_tw,
        predict: ele.spread_option,
        ori_bets: ele.spread_bets,
        bets: ele.spread_bets !== null ? ele.spread_bets * ele.spread_result_flag : null,
        result: ele.spread_result,
        end: returnSettlement(ele.spread_result_flag)
      },
      totals: {
        id: ele.totals_id,
        handicap: ele.totals_handicap,
        over_tw: ele.over_tw,
        predict: ele.totals_option,
        ori_bets: ele.total_bets,
        bets: ele.total_bets !== null ? ele.totals_bets * ele.totals_result_flag : null,
        result: ele.totals_result,
        end: returnSettlement(ele.totals_result_flag)
      }
    }
  };
  // XXX error handling should be more careful
  // const [err, result] = await modules.to(Promise.resolve(data));
  // if (err) throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh);
  return data;
}

function returnSettlement(flag) {
  const { loss, lossHalf, fair, win, winHalf, abnormal } = settlement;
  if (flag === abnormal) return abnormal;
  if (flag === win || flag === winHalf) return win;
  if (flag === fair) return fair;
  if (flag === loss || flag === lossHalf) return loss;
}

module.exports = predictionHistory;
