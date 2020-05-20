const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
const db = require('../util/dbUtil');
// const Collection = db.Collection;

async function inserttest() {
  const queries = await db.sequelize.query(
    `(
        SELECT bets_id
        from   matches
        where  status=0
        AND    home_points IS NOT NULL 
        AND    spread_ID IS NOT NULL 
        AND    spread_result IS NULL
     )`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  for (let i = 0; i < queries.length; i++) {
    await settleMatchesModel({
      token: {
        uid: '999'
      },
      bets_id: queries[i].bets_id
    });
  }

  // await settleMatchesModel({
  //   token: {
  //     uid: '999'
  //   },
  //   bets_id: betsID
  // });
}
module.exports = inserttest;
