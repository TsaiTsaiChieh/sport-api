const modules = require('../../util/modules');
const to = require('await-to-js').default;
const leagueUtil = require('../../util/leagueUtil');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const TWO_WEEKS = 14;
const lastPeriod = 3;
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
  [err, userData] = await to(dbEngine.findUser(args.uid));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  const periodData = calculatePeriodData(args.now);
  [err, historyData] = await to(getUserPredictionData(userData, periodData));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  [err, historyLogs] = await to(repackageReturnData(historyData, periodData));
  if (err) throw new AppErrors.PredictionHistoryModelError(err.stack, err.status);
  return historyLogs;
}

function calculatePeriodData(now) {
  const { period } = modules.getTitlesPeriod(now);
  const periods = [];
  for (let i = 0; i < lastPeriod; i++) periods.push(period - i);
  const PeriodData = modules.getEachPeriodData(periods);
  PeriodData.periods = periods;
  return PeriodData;
}

async function getUserPredictionData(userData, periodData) {
  const begin = periodData[0].begin.unix;
  const end = periodData[periodData.length - 1].end.unix;
  const [err, results] = await to(db.sequelize.query(
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
  LEFT JOIN match__spreads AS spread
         ON spread.spread_id = prediction.spread_id
  LEFT JOIN match__totals AS totals
         ON totals.totals_id = prediction.totals_id
      WHERE prediction.uid = :uid
        AND game.scheduled BETWEEN :begin and :end
        AND game.status = :status
        AND game.flag_prematch = :flag_prematch
   ORDER BY game.scheduled DESC`,
    {
      type: db.sequelize.QueryTypes.SELECT,
      replacements: {
        uid: userData.uid,
        status: leagueUtil.MATCH_STATUS.END,
        begin,
        end,
        flag_prematch: leagueUtil.MATCH_STATUS.VALID
      }
    }));

  if (err) throw new AppErrors.MysqlError(err.stack);
  return results;
}

async function repackageReturnData(historyData, periodData) {
  const data = {};
  data.periods = periodData.periods;
  data.begin_date = [];
  data.leagues = {};
  for (let i = periodData.length - 1; i >= 0; i--) data.begin_date.push(periodData[i].begin.format);
  const groupByLeague = modules.groupBy(historyData, 'league_id');
  groupByLeague.map(function(eachLeagueItems) {
    // Initial
    const league = leagueUtil.leagueDecoder(eachLeagueItems[0].league_id);
    data.leagues[league] = {};

    for (let i = periodData.length - 1; i >= 0; i--) {
      const pastPredictions = new Array(TWO_WEEKS);
      for (let j = 0; j < TWO_WEEKS; j++) {
        const tempArray = [];
        eachLeagueItems.map(async function(match) {
          const matchDate = modules.convertTimezoneFormat(match.scheduled);
          const matchUnix = modules.convertTimezone(matchDate);
          const addOneDayUnix = periodData[i].begin.unix + (j * ONE_DAY_UNIX);

          if (matchUnix === addOneDayUnix) {
            const [err, result] = await modules.to(repackageMatchDate(match, matchDate));
            if (err) throw new AppErrors.RepackageError(err.stack);
            tempArray.push(result);
          }
        });
        pastPredictions[j] = tempArray;
      }
      data.leagues[league][`period_${periodData[i].period}`] = pastPredictions;
    }
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
        ori_bets: ele.totals_bets,
        bets: ele.total_bets !== null ? ele.totals_bets * ele.totals_result_flag : null,
        result: ele.totals_result,
        end: returnSettlement(ele.totals_result_flag)
      }
    }
  };
  // XXX error handling should be more careful
  // const [err, result] = await to(Promise.resolve(data));
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
