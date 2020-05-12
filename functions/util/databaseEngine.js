const db = require('./dbUtil');
const AppError = require('./AppErrors');

function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is const, taking 165ms
      const result = await db.User.findOne({ where: { uid }, raw: true });
      if (!result) return reject(new AppError.UserNotFound('by TsaiChieh'));
      return resolve(result); // else return user data
    } catch (err) {
      return reject(new AppError.UserNotFound(`${err.stack} by TsaiChieh`));
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
