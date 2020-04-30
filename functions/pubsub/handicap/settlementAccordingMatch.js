const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const endStatus = 0;
async function settlement(req, res) {
  // db.Match.sync();
  // 1. query match status = 0 and spread_id is not null
  const spreadSnapshot = await queryMatchWhichSpreadIsNotNull();

  // 2. 算開盤結果
}

function queryMatchWhichSpreadIsNotNull() {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT bets_id, spread_id, home_points, away_points
           FROM matches
          WHERE status = ${endStatus}
            AND spread_id IS NOT NULL
            AND home_points IS NOT NULL
            AND away_points IS NOT NULL`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(result[0]);
    } catch (err) {
      console.log(err);
      return reject(new AppErrors.MysqlError());
    }
  });
}

// function
module.exports = settlement;
