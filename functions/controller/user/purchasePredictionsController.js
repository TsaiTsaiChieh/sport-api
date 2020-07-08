const modules = require('../../util/modules');
const model = require('../../model/user/purchasePredictionsModel');

async function purchasePredictions(req, res) {
  const now = new Date();
  const schema = {
    type: 'object',
    required: ['god_uid', 'god_title', 'matches_date', 'discount'],
    properties: {
      god_uid: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter
      },
      god_title: {
        type: 'string',
        enum: modules.acceptLeague
      },
      matches_date: {
        type: 'string',
        format: 'date'
      },
      discount: {
        type: 'boolean'
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  // append needed params to args
  const args = {
    now,
    token: req.token,
    god_uid: req.body.god_uid,
    god_title: req.body.god_title,
    matches_date: req.body.matches_date,
    discount: req.body.discount
  };
  try {
    res.json(await model(args));
  } catch (err) {
    console.error('Error in controller/user/purchasePredictions by TsaiChieh', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = purchasePredictions;

/**
 * @api {post} /user purchase_predictions
 * @apiVersion 1.0.0
 * @apiDescription 使用者（除了自己）可購買大神的預測 by Tsai-Chieh
 * @apiName Purchase the predictions which are god sell
 * @apiGroup User
 * @apiPermission login user with enough coin or dividend
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} god_uid 要購買的大神 uid
 * @apiParam {String} god_title 要購買的大神聯盟種類
 * @apiParam {String} mathes_date 要購買的開賽日期，注意只能購買有販售狀態的，購買當日即可看大神該日所有有下注單的
 * @apiParam {String} discount 是否要用紅利來折扣搞幣
 * @apiParamExample {JSON} Request-Example
 * {
    "god_uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "god_title": "NBA",
    "matches_date": "2020-07-01",
    "discount": false
}
 * @apiSuccessExample {JSON} Success-Response
 {
    "consumer": "QztgShRWSSNonhm2pc3hKoPU7Al2",
    "god_uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
    "god_league": "NBA",
    "discount": false,
    "message": "success"
}
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
