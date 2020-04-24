const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppError = require('../../util/AppErrors');
const GOD_STATUS = 2;
const scheduledStatus = 2;
const inplayStatus = 1;
const endStatus = 0;

async function predictionRate(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const matches = await searchMatches(args);
      const predictions = await searchPredictions(args, matches);
      resolve(repackageReturnData(args.league, predictions, matches));
    } catch (err) {
      return reject(err);
    }
  });
}

// 搜尋該天該聯盟的所有賽事編號，若找到會回傳該天所有賽事編號，沒有則回傳無任何賽事 404
function searchMatches(args) {
  return new Promise(async function (resolve, reject) {
    const { date, league } = args;
    const begin = modules.convertTimezone(date);
    const end =
      modules.convertTimezone(date, {
        op: 'add',
        value: 1,
        unit: 'days'
      }) - 1;

    try {
      const results = await db.sequelize.query(
        `SELECT game.bets_id, game.status
           FROM matches AS game FORCE INDEX(matches_scheduled)
          WHERE game.scheduled BETWEEN ${begin} AND ${end}
            AND game.league_id = ${modules.leagueCodebook(league).id}`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      !results.length ? reject(new AppError.MatchNotFound()) : resolve(results);
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}
// 搜尋所有符合條件的預測單
function searchPredictions(args, matches) {
  return new Promise(async function (resolve, reject) {
    const { user_type } = args;
    const matchArray = [];
    for (let i = 0; i < matches.length; i++) {
      matchArray.push(matches[i].bets_id);
    }
    try {
      // 一般玩家 + 大神玩家
      if (user_type === 'all') {
        const results = await db.sequelize.query(
          `SELECT bets_id, spread_option, totals_option
             FROM user__predictions AS prediction FORCE INDEX(user__predictions_bets_id)
            WHERE bets_id IN (${matchArray})`,
          { type: db.sequelize.QueryTypes.SELECT }
        );
        return resolve(results);
      }
      // 只有大神玩家
      if (user_type === 'god') {
        const results = await db.sequelize.query(
          `SELECT bets_id, spread_option, totals_option
             FROM user__predictions AS prediction FORCE INDEX(user__predictions_bets_id)
            WHERE bets_id IN (${matchArray})
              AND user_status = ${GOD_STATUS}`,
          { type: db.sequelize.QueryTypes.SELECT }
        );

        return resolve(results);
      }
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

function repackageReturnData(league, predictions, matches) {
  const data = {
    scheduled: [],
    inplay: [],
    end: []
  };
  const statsRate = [];
  // initial
  for (let i = 0; i < matches.length; i++) {
    matches[i] = {
      id: matches[i].bets_id,
      status: matches[i].status,
      league,
      spread: { home: 0, away: 0, home_rate: '0%', away_rate: '0%' },
      totals: { under: 0, over: 0, under_rate: '0%', over_rate: '0%' }
    };
  }

  // Group by bets_id as key to the prediction array
  const predictionGroupedMatchId = modules.groupBy(predictions, 'bets_id');

  for (const key in predictionGroupedMatchId) {
    statsRate.push(calculatePredictionRate(predictionGroupedMatchId[key]));
  }
  // 預測單的陣列數量需和賽事的一致
  const eachMatchRate = filloutStatsRate(matches, statsRate);
  for (let i = 0; i < eachMatchRate.length; i++) {
    const match = eachMatchRate[i];
    if (match.status === scheduledStatus) {
      data.scheduled.push(match);
    } else if (match.status === inplayStatus) {
      data.inplay.push(match);
    } else if (match.status === endStatus) {
      data.end.push(match);
    }
  }
  return data;
}

// 計算各賽事的盤口預測數目
function calculatePredictionRate(prediction) {
  const result = {
    id: '',
    spread: { home: 0, away: 0, home_rate: 0, away_rate: 0 },
    totals: { under: 0, over: 0, under_rate: 0, over_rate: 0 }
  };

  for (let i = 0; i < prediction.length; i++) {
    result.id = prediction[i].bets_id;
    if (prediction[i].spread_option === 'home') result.spread.home += 1;
    if (prediction[i].spread_option === 'away') result.spread.away += 1;
    if (prediction[i].totals_option === 'under') result.totals.under += 1;
    if (prediction[i].totals_option === 'over') result.totals.over += 1;
  }

  const { spread, totals } = result;
  // 避免分母為零
  const spreadDeno = spread.home + spread.away ? spread.home + spread.away : 1;
  const totalsDeno =
    totals.under + totals.over ? totals.under + totals.over : 1;

  spread.home_rate = `${Math.floor((spread.home / spreadDeno) * 100)}%`;
  spread.away_rate = `${Math.floor((spread.away / spreadDeno) * 100)}%`;
  totals.under_rate = `${Math.floor((totals.under / totalsDeno) * 100)}%`;
  totals.over_rate = `${Math.floor((totals.over / totalsDeno) * 100)}%`;
  return result;
}

function filloutStatsRate(matches, statsRate) {
  for (let i = 0; i < matches.length; i++) {
    for (let j = 0; j < statsRate.length; j++) {
      if (matches[i].id === statsRate[j].id) {
        matches[i].spread = statsRate[j].spread;
        matches[i].totals = statsRate[j].totals;
      }
    }
  }
  return matches;
}
module.exports = predictionRate;
