const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function IngotModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const body = req.body;
      let reporter = {};
      if (body.third_party === 'neweb') {
        /* 統計所有購買搞幣、紅利數量(藍新) */
        reporter = await db.sequelize.query(
                `
                SELECT uid, third_party, SUM(coin) AS sum_coin, SUM(dividend) AS sum_dividend FROM cashflow_deposits WHERE (third_party IS NULL OR third_party='neweb') AND order_status = 1 GROUP BY uid
                `,
                {
                  type: db.sequelize.QueryTypes.SELECT
                });
      } else if (body.third_party === 'gash') {
        /* 統計所有購買搞幣、紅利數量(Gash) */
        reporter = await db.sequelize.query(
                `
                SELECT uid, third_party, SUM(coin) as sum_coin, SUM(dividend) as sum_dividend FROM cashflow_deposits WHERE third_party='gash' AND order_status=1 GROUP BY uid;
                `,
                {
                  type: db.sequelize.QueryTypes.SELECT
                });
      } else {
        /* 統計所有購買搞幣、紅利數量(全部) */
        reporter = await db.sequelize.query(
                `
                SELECT uid, third_party, SUM(coin) as sum_coin, SUM(dividend) as sum_dividend FROM cashflow_deposits WHERE order_status=1 GROUP BY uid;
                `,
                {
                  type: db.sequelize.QueryTypes.SELECT
                });
      }
      resolve(reporter);
    } catch (err) {
      console.log('Error in  reporter/ingot by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = IngotModel;
