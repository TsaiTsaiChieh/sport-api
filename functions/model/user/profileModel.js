const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');

function profile(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      return resolve(await getUserData(uid));
    } catch (err) {
      return reject(err);
    }
  });
}

function getUserData(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is const, taking about 165ms
      const result = await db.User.findOne({
        where: { uid },
        raw: true,
        attributes: ['display_name', 'signature', 'fan_count']
      });
      return resolve(result);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

module.exports = profile;
