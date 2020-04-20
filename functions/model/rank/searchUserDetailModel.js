const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function searchUserDetail(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let uid = args;
      const searchUser = await db.sequelize.query(
      `SELECT * FROM users WHERE uid = '${uid}'`,
      {
          type: db.sequelize.QueryTypes.SELECT,
      })

      resolve({ searchUser: searchUser });
    } catch (err) {
      console.log('Error in  rank/searchUserDetail by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = searchUserDetail;
