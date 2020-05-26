const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

function purchasePredictions(args) {
// 1. 檢查購買的大神是否有效
  const godUserData = dbEngine.findUser(args.god_uid);
}

module.exports = purchasePredictions;
