// const settleMatchesModel = require('../model/user/settleMatchesModel');
const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const Sp = db.Spread;
async function inserttest(req, res) {
  try {
    const unix = Math.floor(Date.now() / 1000);
    const tomorrow = modules.convertTimezoneFormat(unix, {
      op: 'add',
      value: 1,
      unit: 'days'
    });
    const now = modules.convertTimezoneFormat(unix);
    console.log(now);
    console.log(tomorrow);
  } catch (err) {
    console.log(err);
  }
}
module.exports = inserttest;
