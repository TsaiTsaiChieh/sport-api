const modules = require('../util/modules');
const db = require('../util/dbUtil');
const settleMatchesModel = require('../model/user/settleMatchesModel');
// inserttest();
async function inserttest() {
  try {
    await settleMatchesModel({
      token: { uid: '999' },
      bets_id: '2354719'
    });
  } catch (err) {
    console.log(err);
  }
}
module.exports = inserttest;
