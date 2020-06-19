const db = require('../../util/dbUtil');

async function mpgNotifyModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const expire = await db.sequelize.query(
        `
        INSERT cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real) VALUES ('33333', 3, 3, 3, 3, 1, 1)
        `,
        {
          logging: true,
         
          type: db.sequelize.QueryTypes.INSERT
        });
      resolve(expire);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgNotifyModel;
