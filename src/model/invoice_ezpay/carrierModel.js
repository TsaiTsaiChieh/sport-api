const db = require('../../util/dbUtil');
async function carrierModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      console.log(req);
      const uid = req.token.uid;
      console.log('222');
      const invoice_carrier = req.body.invoice_carrier;
      console.log('333');
      const carrier = {
        uid: uid,
        invoice_carrier: invoice_carrier
      };
      console.log('444');
      /* 新增載具 */
      if(req.method=== "GET" ){
        try{
          const carrier_status = await db.User.findOne({
            where: {
              invoice_carrier:invoice_carrier
            },
            attributes: ['uid','invoice_carrier'],
            raw: true
          })
          if(carrier_status){
            resolve({'status':'success'});
          }
        } catch (e) {
          reject({'status':'failed'});
        }
      } else if (req.method === 'POST') {
        try{
          const carrier_status = await db.User.create(carrier);
          if(carrier_status){
            resolve({'status':'success'});
          }
        } catch (e) {
          reject({'status':'failed'});
        }
      /* 更新載具 */
      } else if (req.method === 'PUT') {
        try{
          const carrier_type = db.User.update({
            invoice_carrier: invoice_carrier
          }, {
            where: {
              uid: uid
            }
          });
          if(carrier_status){
            resolve({'status':'success'});
          }
        } catch (e) {
          reject({'status':'failed'});
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = carrierModel;
