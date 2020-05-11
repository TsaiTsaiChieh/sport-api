const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function purseModel(args, method, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.moment().startOf('month').subtract('month',1).unix();
      const end   = modules.moment().endOf('month').endOf('month').subtract('month',1).unix();

      const purse = await db.sequelize.query(
        `
        SELECT coin, dividend, ingot
          FROM users 
        WHERE uid = $uid
        `,
        {
          plain: true,
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });
        
      const expire = await db.sequelize.query(
        `SELECT SUM(money_value) as dividend
           FROM user__transfer__logs
          WHERE to_uid = $uid
            AND money_type=0
            AND scheduled
        BETWEEN $begin AND $end   
        `,
        {
          plain:true,
          bind: { uid: uid, begin:begin, end:end },
          type: db.sequelize.QueryTypes.SELECT
        }
      )
      const expire_dividend = parseInt(expire.dividend);
      const purseList = {
        purse,
        expire_dividend
      };
      resolve(purseList);
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = purseModel;
