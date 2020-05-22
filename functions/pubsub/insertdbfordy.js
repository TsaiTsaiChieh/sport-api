// const settleMatchesModel = require('../model/user/settleMatchesModel');
const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const MATCHL = db.League;
async function inserttest() {
  const begin = modules.convertTimezone(
    modules.moment().utcOffset(8).format('YYYY-MM-DD')
  );
  const end =
    modules.convertTimezone(
      modules.moment().utcOffset(8).format('YYYY-MM-DD'),
      {
        op: 'add',
        value: 2,
        unit: 'days'
      }
    ) - 1;

  console.log(begin);
  console.log(end);
}
module.exports = inserttest;
