const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
function CoinModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      /* 站內所有搞幣整合(依照使用者) */
      const reporter = await db.sequelize.query(
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
      resolve(reporter);
    } catch (err) {
      console.log('Error in  reporter/coin by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = CoinModel;
