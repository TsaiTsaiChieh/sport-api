const modules = require('../util/modules');
const db = require('../util/dbUtil');
const settleMatchesModel = require('../model/user/settleMatchesModel');
// inserttest();

async function inserttest() {
  const args = { token: { uid: '999' }, bets_id: '2352012' };
  await settleMatchesModel(args);
}
module.exports = inserttest;
