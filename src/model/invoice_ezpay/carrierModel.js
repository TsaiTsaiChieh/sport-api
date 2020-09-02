const db = require('../../util/dbUtil');
async function carrierModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = req.token.uid;
      let invoice_carrier = req.body.invoice_carrier;

      /* 新增/更新載具 */
      if (req.method === 'POST') {
        try {
          if (req.body.carrier_status === 0) {
            const default_invoice_carrier = '/ABCDEFG';
            invoice_carrier = default_invoice_carrier;
          }
          const carrier_status = db.User.update({
            invoice_carrier: invoice_carrier
          }, {
            where: {
              uid: uid
            }
          });
          if (carrier_status) {
            resolve({ status: 'success' });
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
