const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const MATCHL = db.League;
async function inserttest(req, res) {
  await settleMatchesModel({
    token: {
      uid: '999'
    },
    bets_id: 2373519
  });

  res.json('ok');
}
module.exports = inserttest;
