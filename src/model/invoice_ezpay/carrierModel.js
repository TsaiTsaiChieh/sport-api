const db = require('../../util/dbUtil');
async function carrierModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = req.uid;
      const invoice_carrier = req.invoice_carrier;
      const carrier = {
        uid: uid,
        invoice_carrier: invoice_carrier
      };
      /* 新增載具 */
      if (req.method === 'POST') {
        db.User.create(carrier);
      /* 更新載具 */
      } else if (req.method === 'PUT') {
        db.User.update({
          invoice_carrier: invoice_carrier
        }, {
          where: {
            uid: uid
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = carrierModel;
