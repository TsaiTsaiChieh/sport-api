const db = require('../../util/dbUtil');

async function mpgNotifyModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const ret = JSON.stringify(args);
      const expire = await db.sequelize.query(
        `
        INSERT cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real, serial_number) VALUES ('33333', 3, 3, 3, 3, 1, 1, :ret)
        `,
        {
          logging: true,
          replacements: 
          {
            ret: ret
          },
            type: db.sequelize.QueryTypes.INSERT
        });
      resolve(expire);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgNotifyModel;
