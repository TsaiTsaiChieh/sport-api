// const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
// const db = require('../util/dbUtil');
// const Collection = db.Collection;

async function inserttest() {
  const handicapObj = 2.75;
  const str = handicapObj.toString();
  const str1 = str.split('.')[0];
  const str2 = str.split('.')[1];
  console.log(parseFloat(str1) + 1, str2);
}
module.exports = inserttest;
