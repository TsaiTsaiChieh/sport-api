const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function searchUser(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let display_name = args;
      let limit        = 10;
      const searchUser = await db.sequelize.query(
      `SELECT * FROM users WHERE display_name LIKE '%${display_name}%' LIMIT ${limit}`,
      {
          type: db.sequelize.QueryTypes.SELECT,
      });

      resolve({ searchUser: searchUser });
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = searchUser;
