const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function searchUser (args) {
  return new Promise(async function (resolve, reject) {
    try {
      const display_name = args;
      const limit = 10;
      const searchUser = await db.sequelize.query(
      `
      SELECT uid, display_name 
        FROM users 
       WHERE display_name 
        LIKE '%${display_name}%' 
       LIMIT ${limit}
       `,
      {
        type: db.sequelize.QueryTypes.SELECT
      });

      resolve({ searchUser: searchUser });
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = searchUser;
