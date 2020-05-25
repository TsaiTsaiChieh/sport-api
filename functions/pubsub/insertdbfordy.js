const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const MATCHL = db.League;
async function inserttest(req, res) {
  const aa = await settleMatchesModel({
    token: {
      uid: '999'
    },
    bets_id: '2394170'
  });

  res.json(aa);
}
module.exports = inserttest;
