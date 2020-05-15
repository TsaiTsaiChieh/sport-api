// const settleMatchesModel = require('../model/user/settleMatchesModel');
// const modules = require('../util/modules');
const db = require('../util/dbUtil');
const Collection = db.Collection;
async function inserttest() {
  // await Collection.sync({ force: true });
  // await Collection.upsert({
  //   bets_id: '123',
  //   uid: '123',
  //   league_id: '123',
  //   scheduled: '123',
  //   scheduled_tw: 1589511051297
  // });
  let uid = '2368755';
  const mysqlUser = await db.sequelize.query(
    `
      SELECT *
        FROM matches
       WHERE bets_id = ${uid}
       
     `,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  console.log(mysqlUser);
}
module.exports = inserttest;
