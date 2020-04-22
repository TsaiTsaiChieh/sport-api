const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function defaultLeague (args) {
  return new Promise(async function (resolve, reject) {
    try {
    //   const searchUser = await db.sequelize.query(
    //   `SELECT * FROM match_league`,
    //   {
    //       type: db.sequelize.QueryTypes.SELECT,
    //   });
      const defaultLeague = {
        MLB: []
      };
      resolve({ defaultLeague: defaultLeague });
    } catch (err) {
      console.log('Error in  rank/defaultLeauge by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = defaultLeague;
