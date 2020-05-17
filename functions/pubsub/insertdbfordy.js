// const settleMatchesModel = require('../model/user/settleMatchesModel');
const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const Collection = db.Collection;

async function inserttest() {
  const date = modules.moment();

  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(24, 'hours');
  console.log(beginningDate.unix());
  console.log(endDate.unix());
}
module.exports = inserttest;
