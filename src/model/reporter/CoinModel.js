const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
function CoinModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const body = req.body;
      let reporter = {};
      if (body.type === 'insite') {
      /* 站內所有搞幣整合(依照使用者) */
        reporter = await db.sequelize.query(
            `
            SELECT uid, SUM(coin) as sum_coin FROM
                (
                    SELECT uid, coin FROM cashflow_buys
                    UNION
                    SELECT uid, coin FROM cashflow_deposits WHERE order_status=1
                    UNION
                    SELECT uid, coin FROM cashflow_donates
                    UNION
                    SELECT uid, coin FROM cashflow_ingot_transfers
                    UNION
                    SELECT uid, coin FROM cashflow_missions
                    UNION
                    SELECT uid, coin FROM cashflow_transfer_logs
                ) statistics
            GROUP BY statistics.uid
            `,
            {
              type: db.sequelize.QueryTypes.SELECT
            });
      } else if (body.type === 'statistics') {
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
      }

      resolve(reporter);
    } catch (err) {
      console.log('Error in  reporter/coin by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = CoinModel;
