// const settleMatchesModel = require('../model/user/settleMatchesModel');
const modules = require('../util/modules');
const db = require('../util/dbUtil');
// const Sp = db.Spread;
// const to = require('await-to-js').default;
async function inserttest(req, res) {
  try {
    const unix = Math.floor(Date.now() / 1000);
    const tomorrow = modules.convertTimezoneFormat(unix, {
      format: 'YYYY-MM-DD 00:00:00',
      op: 'add',
      value: 1,
      unit: 'days'
    });
    const now = modules.convertTimezoneFormat(unix, {
      format: 'YYYY-MM-DD 00:00:00'
    });
    
  } catch (err) {
    console.log(err);
  }
}
module.exports = inserttest;
