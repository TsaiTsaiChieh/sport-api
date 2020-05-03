const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function transferModel(args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = args.begin;
      const end = args.end;
      const transfer = await db.sequelize.query(
      `
        SELECT transfer_id, scheduled, type, content 
          FROM user__transfer__logs 
         WHERE uid = $uid
           AND updatedAt BETWEEN $begin AND $end
       `,
      {
        bind: { uid:uid, begin:begin, end:end},
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
