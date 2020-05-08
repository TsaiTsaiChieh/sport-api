const modules = require('./modules');
const db = require('./dbUtil');
const AppError = require('./AppErrors');

function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const { customClaims } = await modules.firebaseAdmin.auth().getUser(uid);
      if (!customClaims.role) return reject(new AppError.UserNotFound());
      return resolve(customClaims);
    } catch (error) {
      return reject(new AppError.UserNotFound());
    }
  });
}

function getSeason(league_id) {
  return new Promise(async function(resolve, reject) {
    try {
      const results = await db.Season.findOne({
        where: {
          league_id: league_id,
          current: 1
        },
        attributes: ['season']
      });
      return resolve(results.season);
    } catch (err) {
      return reject(new AppError.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}
module.exports = {
  findUser,
  getSeason
};
