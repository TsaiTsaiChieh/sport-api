const db = require('../../util/dbUtil');
const ezpay_config = require('../../config/invoice/ezpay_config');
async function carrierModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = req.token.uid;
      let invoice_carrier = req.body.invoice_carrier;
      /* 新增/更新載具 */

      if (req.method === 'POST') {
        try {
          if (req.body.carrier_status === 0) {
            invoice_carrier = ezpay_config.default_invoice_carrier;
          }
          await db.User.update({
            invoice_carrier: invoice_carrier,
            carrier_status: req.body.carrier_status
          }, {
            where: {
              uid: uid
            }
          });
          const getCarrier = await db.sequelize.query(`
            SELECT invoice_carrier, carrier_status FROM users WHERE uid='${req.token.uid}'
          `,
          {
            raw: true,
            type: db.sequelize.QueryTypes.SELECT
          });
          if (getCarrier) {
            resolve(getCarrier);
          } else {
            resolve({ status: 'failed' });
          }
        } catch (e) {
          reject({ status: 'failed' });
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = carrierModel;
