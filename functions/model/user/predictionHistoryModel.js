const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');

/*
* 1. 檢查該使用者存在與否
* 2.
*/

async function predictionHistory(args) {
  const [err, userData] = await modules.to(dbEngine.findUser(args.uid));
  if (err) throw new AppErrors.PredictionHistoryError(err.stack, err.status);
  // return Promise.reject(new AppErrors.PredictionHistoryError(err.stack, err.status));
}

module.exports = predictionHistory;
