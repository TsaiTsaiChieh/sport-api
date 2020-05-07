const modules = require('../util/modules');
const db = require('../util/dbUtil');
const settleMatchesModel = require('../model/user/settleMatchesModel');
// inserttest();
async function inserttest() {
  try{
  const args = { token: { uid: '999' }, bets_id: '2349871' };
  await settleMatchesModel(args);
  }catch(err)
  {
    console.log(err);
    
  }
  
}
module.exports = inserttest;
