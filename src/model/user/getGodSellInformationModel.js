const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');
const AppError = require('../../util/AppErrors');
const db = require('../../util/dbUtil');

function godSellInformation(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const unix = {
        begin: modules.convertTimezone(args.date),
        end:
          modules.convertTimezone(args.date, {
            op: 'add',
            value: 1,
            unit: 'days'
          }) - 1
      };

      const result = await getPredictionDescription(args, unix);
      return resolve(repackageReturnData(result));
    } catch (err) {
      return reject(err);
    }
  });
}

function getPredictionDescription(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT *
           FROM user__prediction__descriptions
          WHERE uid = :uid
            AND day = ${unix.begin}
            AND league_id = ${leagueUtil.leagueCodebook(args.league).id}`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { uid: args.uid }
        });
      return resolve(result[0]);
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

function repackageReturnData(result) {
  if (result) {
    return {
      desc: result.description, tips: result.tips
    };
  } else return {};
}
module.exports = godSellInformation;
