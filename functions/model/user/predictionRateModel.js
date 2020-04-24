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
      // db.Prediction.sync();
      const matches = await searchMatches(args);
      const predictions = await searchPredictions(args, matches);
      const results = calculatePredictionRate(predictions);
      resolve(results);
    } catch (err) {
      console.log(err);
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

function calculatePredictionRate(predictions) {
  // const data = {
  //   scheduled: [],
  //   inplay: [],
  //   end: []
  // };
  // for (let i = 0; i < matches.length; i++) {
  //   const match = matches[i];
  //   if (match.status === scheduledStatus) {
  //     data.push(match.bets_id);
  //   }
  // }
  // for (const key in predictions) {
  //   if (Object.prototype.hasOwnProperty.call(predictions, key)) {
  //     const ele = predictions[key];
  //     console.log(ele);
  //   }
  // }

  // Group by color as key to the person array
  const predictionGroupedMatchId = groupBy(predictions, 'bets_id');
  for (const key in predictionGroupedMatchId) {
    if (predictionGroupedMatchId.hasOwnProperty(key)) {
      //   const element = predictionGroupedMatchId[key];
      for (let i = 0; i < predictionGroupedMatchId[key].length; i++) {
        const element = array[i];
      }
    }
    console.log(key);
  }
  console.log(predictionGroupedMatchId);
}

function groupBy(array, key) {
  return array.reduce(function (result, currentValue) {
    // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result;
  }, {});
}

module.exports = predictionRate;
