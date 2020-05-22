// const settleMatchesModel = require('../model/user/settleMatchesModel');
const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const MATCHL = db.League;
async function inserttest(req, res) {
  console.log(
    modules.convertTimezoneFormat('1590163199', {
      format: 'YYYY-MM-DD'
    })
  );

  res.json('ok');
}
module.exports = inserttest;
