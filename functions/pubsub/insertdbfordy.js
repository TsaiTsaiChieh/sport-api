// const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
const db = require('../util/dbUtil');

async function inserttest() {
  await db.Match.sync();
}
module.exports = inserttest;
