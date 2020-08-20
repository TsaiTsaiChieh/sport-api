const db = require('../../util/dbUtil');
async function carrierModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = req.token.uid;
      const invoice_carrier = req.body.invoice_carrier;
      const carrier = {
        uid: uid,
        invoice_carrier: invoice_carrier
      };

      /* 新增/更新載具 */
      if (req.method === 'POST') {
        try {
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
