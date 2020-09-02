const { getEachPeriodData, groupBy, convertTimezoneFormat, convertTimezone } = require('./modules');
const leagueUtil = require('./leagueUtil');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const settlement = {
  loss: -1,
  lossHalf: -0.5,
  fair: 0,
  win: 1,
  winHalf: 0.5,
  abnormal: -2
};
const ONE_DAY_UNIX = convertTimezone(0, { op: 'add', value: 1, unit: 'days' });
const TWO_WEEKS = 14;

async function settleAccordingPeriodAndUser(period, uid) {
  try {
    const periodData = getEachPeriodData([period]);
    const begin = periodData[0].begin.unix;
    const end = periodData[0].end.unix;
    const userPredictionData = await getUserPredictionData(uid, { begin, end });
    const historyLogs = await repackageReturnData(userPredictionData, begin);
    return Promise.resolve(historyLogs);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function getUserPredictionData(uid, periodUnix) {
  try {
    const { begin, end } = periodUnix;
    const results = await db.sequelize.query(
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
        uid,
        status: leagueUtil.MATCH_STATUS.END,
        begin,
        end,
        flag_prematch: leagueUtil.MATCH_STATUS.VALID
      }
    });
    return Promise.resolve(results);
  } catch (err) {
    return Promise.reject(new AppErrors.MysqlError(err.stack));
  }
}

async function repackageReturnData(historyData, begin) {
  try {
    const data = {};
    data.leagues = {};
    const groupByLeague = groupBy(historyData, 'league_id');
    groupByLeague.map(function(eachLeagueItems) {
    // Initial
      const league = leagueUtil.leagueDecoder(eachLeagueItems[0].league_id);
      data.leagues[league] = {};

      const pastPredictions = new Array(TWO_WEEKS);
      for (let j = 0; j < TWO_WEEKS; j++) {
        const tempArray = [];
        eachLeagueItems.map(async function(match) {
          const matchDate = convertTimezoneFormat(match.scheduled);
          const matchUnix = convertTimezone(matchDate);
          const addOneDayUnix = begin + (j * ONE_DAY_UNIX);
          if (matchUnix === addOneDayUnix) {
            const result = await repackageMatchDate(match, matchDate);
            tempArray.push(result);
          }
        });
        pastPredictions[j] = tempArray;
      }
      data.leagues[league] = pastPredictions;
    });
    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(new AppErrors.RepackageError(err.stack));
  }
}

async function repackageMatchDate(ele, matchDate) {
  try {
    const data = {
      match: {
        date: matchDate,
        league_id: ele.league_id,
        id: ele.bets_id,
        sport_id: ele.sport_id,
        scheduled: ele.scheduled
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
    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(new AppErrors.RepackageError(err.stack));
  }
}

function returnSettlement(flag) {
  const { loss, lossHalf, fair, win, winHalf, abnormal } = settlement;
  if (flag === abnormal) return abnormal;
  if (flag === win || flag === winHalf) return win;
  if (flag === fair) return fair;
  if (flag === loss || flag === lossHalf) return loss;
}

module.exports = {
  settlement,
  settleAccordingPeriodAndUser
};
