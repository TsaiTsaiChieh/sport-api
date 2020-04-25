const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function transferModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = args;
      const transfer = await db.sequelize.query(
      `
        SELECT transfer_id, scheduled, type, content 
          FROM transfer_logs 
         WHERE uid = '${uid}'
       `,
      {
        type: db.sequelize.QueryTypes.SELECT
      });
      resolve(transfer);
    } catch (err) {
      console.log('Error in user/tranfer by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = transferModel;
