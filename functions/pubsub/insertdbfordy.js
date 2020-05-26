const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;

async function inserttest(req, res) {
  try {
    const [err, r] = await to(
      db.Match.update(
        {
          spread_result: null,
          totals_result: null
        },
        {
          where: {
            bets_id: '2398520'
          }
        }
      )
    );
    console.log(err);
    console.log(r[0]);

    res.json('ok');
  } catch (err) {
    console.log(err);
  }
}
module.exports = inserttest;
