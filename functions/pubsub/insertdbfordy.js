const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const MATCHL = db.League;
async function inserttest() {
  let aa = await settleMatchesModel({
    token: {
      uid: '999'
    },
    bets_id: '2386563'
  });
  console.log(aa);
}
module.exports = inserttest;
