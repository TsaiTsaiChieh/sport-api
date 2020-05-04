const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function purseModel(uid) {
  return new Promise(async function(resolve, reject) {
    try {
        const purse = await db.sequelize.query(
        `
        SELECT coin, point, ingot
          FROM users 
        WHERE uid = $uid
        `,
        {
          plain: true,
          bind: { uid: uid },
          type: db.sequelize.QueryTypes.SELECT
        });

        const bank = await db.sequelize.query(
          `
          SELECT bank_code, bank_username, bank_account
            FROM user__banks
          WHERE uid = $uid
          `,
          {
            plain: true,
            bind: { uid: uid },
            type: db.sequelize.QueryTypes.SELECT
          });

        const purseList = {
          purse,
          bank
        };
        resolve(purseList);
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = purseModel;
