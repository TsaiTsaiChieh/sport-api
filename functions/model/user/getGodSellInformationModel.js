const modules = require('../../util/modules');
const AppError = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const SELL = 1;

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

      await isGodBelongToLeague(args, args.token.customClaims.titles);
      await checkPredictionSell(args, unix);
      const result = await getPredictionDescription(args, unix);
      return resolve(repackageReturnData(result));
    } catch (err) {
      return reject(err);
    }
  });
}

// 檢查是否為該聯盟的大神
function isGodBelongToLeague(args, titles = []) {
  return new Promise(function(resolve, reject) {
    !titles.includes(args.league)
      ? reject(new AppError.UserNotBelongToGod())
      : resolve();
  });
}
// 檢查該大神該天的販售狀態是否確實為「販售」
function checkPredictionSell(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT sell
           FROM user__predictions AS prediction
          WHERE uid = "${args.token.uid}"
            AND match_scheduled BETWEEN ${unix.begin} AND ${unix.end}
          LIMIT 1`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      result[0] !== SELL
        ? resolve()
        : reject(new AppError.CouldNotFillInSellInformation());
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

function getPredictionDescription(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.PredictionDescription.findOne({
        where: {
          uid: args.token.uid,
          league_id: modules.leagueCodebook(args.league).id,
          day: unix.begin
        },
        attributes: ['description', 'tips']
      });
      return resolve(result);
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

function repackageReturnData(result) {
  return {
    desc: result.description, tips: result.tips
  };
}
module.exports = godSellInformation;
/**
 * @api {GET} /user/sell_information?league=NBA&date=2020-07-01 Post sell information
 * @apiVersion 1.0.0
 * @apiDescription Get sell information included description(說明文) and tips(武功秘笈) by TsaiChieh
 * @apiName Get sell information
 * @apiGroup User
 *
 * @apiParam {String} prematch date, ex: ```2020-07-01```
 * @apiParam {String} league league name, the value enum are: ```NBA```
 *
 * @apiSuccess {String} response
 * {
    "desc": "大家快來買我的牌，我預測了超多！我又新增了兩場喔",
    "tips": "買了就送你 my precious"
}
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * "Upsert successful"
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "enum",
        "dataPath": ".league",
        "schemaPath": "#/properties/league/enum",
        "params": {
            "allowedValues": [
                "NBA"
            ]
        },
        "message": "should be equal to one of the allowed values"
    }
]
 *
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
