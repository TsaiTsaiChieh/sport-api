const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;

async function inserttest(req, res) {
  await settleMatchesModel({
    token: {
      uid: '999'
    },
    bets_id: '2307346'
  });
}
module.exports = inserttest;
