const ajv = require('../../util/modules').ajv;
const settleMatchesModel = require('../../model/user/settleMatchesModel');

async function settleMatches(req, res) {
  const schema = {
    type: 'object',
    required: ['bets_id'],
    properties: {
      bets_id: {
        type: 'integer',
        minimum: 0, // 避免有負值
        maximum: 9999999999 // 限制在十位數內
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.token = req.token;

    res.json(await settleMatchesModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = settleMatches;
/**
 * @api {get} /settleMatches Settle Matches
 * @apiVersion 1.0.0
 * @apiName settleMatches
 * @apiGroup User
 * @apiPermission None
 *
 * @apiParam (Request header) {Authorization} Authorization bearer token generate from firebase Admin SDK
 * @apiParam (Request body) {bets_id} bets_id bets id (Match id)
 * @apiSuccess {JSON} result Settle Matches success
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "2118058": {
    "status": 1,
    "msg": "賽事結算成功！"
  },
  "2WMRgHyUwvTLyHpLoANk7gWADZn1": {
    "user__predictionss_id": 209,
    "status": 1,
    "msg": "賽事結算成功！"
  },
  "3IB0w6G4V8QUM2Ti3iCIfX4Viux1": {
    "user__predictionss_id": 208,
    "status": 1,
    "msg": "賽事結算成功！"
  }
}
 *
 * @apiError 404
 *
 * @apiErrorExample {JSON} Error-1301
 * HTTP/1.1 404 Not Found
 * {
    "code": "1301",
    "msg": "使用者狀態異常"
 * }
 *
 * @apiError 404
 *
 * @apiErrorExample {JSON} Error-1302
 * HTTP/1.1 404 Not Found
 * {
    "code": "1302",
    "msg": "使用者狀態異常"
 * }
 *
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
