const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function purseModel(args, method, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const from = modules.moment(new Date()).subtract(1, 'months').startOf('month').unix();// 上個月第一天
      const to = modules.moment(new Date()).subtract(1, 'months').endOf('month').unix();// 上個月最後一天
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
        `
          SELECT SUM(expire_points) as dividend
            FROM cashflow_dividends 
           WHERE uid=$uid
             AND scheduled BETWEEN :from AND :to
        `,
        {
          plain: true,
          bind: {  uid: uid, expire_scheduled: expire_scheduled, from: from, to: to },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

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
