const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const GOD_STATUS = 2;

function getTitlesAndSignature(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // check if user exists
      let titles = [];
      const userData = await dbEngine.findUser(args.uid);
      titles = await getGodAllTitles(args, userData);
      return resolve(repackageReturnData(userData, titles));
    } catch (err) {
      return reject({ code: err.code, error: err });
    }
  });
}

function getGodAllTitles(args, userData) {
  return new Promise(async function(resolve, reject) {
    try {
      if (userData.status !== GOD_STATUS) return resolve([]);
      if (userData.status === GOD_STATUS) {
        const { period } = modules.getTitlesPeriod(args.now);
        // index is index_merge(titles), taking 170ms
        const result = await db.Title.findAll({
          where: { uid: args.uid, period },
          attributes: ['league_id', 'rank_id'],
          raw: true
        });
        return resolve(result);
      }
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by Tsai-Chieh`));
    }
  });
}

function repackageReturnData(userData, titles) {
  try {
    const data = {
      signature: userData.signature

    };
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

module.exports = getTitlesAndSignature;
