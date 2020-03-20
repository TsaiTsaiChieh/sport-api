const modules = require('../../util/modules');
const predictInfoModel = require('../../model/user/predictInfoModel');

async function predictInfo(req, res) {
  const schema = {
    type: 'object',
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(modules.ajv.errors);  
  }

  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await predictInfoModel(req.body));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = predictInfo;
/**
 * @api {get} /predictionInfo Get Prediction Info
 * @apiVersion 1.0.0
 * @apiName predictionInfo
 * @apiGroup personal
 * @apiPermission None
 * 
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league shwo league
 * 
 * @apiParamExample {JSON} Request-Example
 * {
 *     "league": "NBA"
 * }
 * 
 * @apiSuccess {JSON} result Available Personal Prediction Info
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
[
  {
    "bets_id": "2119917",
    "scheduled": "",
    "league": "NBA",
    "home": "home名稱",
    "away": "away名稱",
    "spread": {
      "predict": "home",
      "handicap_id": "31296152",
      "handicap": 6.5,
      "percentage": 50,
      "bets": 1
    },
    "totals": {
      "predict": "over",
      "handicap_id": "34452129",
      "handicap": 231.5,
      "percentage": 50,
      "bets": 1
    }
  },
  {
    "bets_id": "2120643",
    "scheduled": "",
    "league": "NBA",
    "home": "home名稱",
    "away": "away名稱",
    "spread": {},
    "totals": {
      "predict": "over",
      "handicap_id": "34409038",
      "handicap": 217,
      "percentage": 50,
      "bets": 1
    }
  },
  {
    "bets_id": "2120646",
    "scheduled": "",
    "league": "NBA",
    "home": "home名稱",
    "away": "away名稱",
    "spread": {
      "predict": "home",
      "handicap_id": "31265641",
      "handicap": 7.5,
      "percentage": 50,
      "bets": 1
    },
    "totals": {}
  },
  {
    "bets_id": "2120647",
    "scheduled": "",
    "league": "NBA",
    "home": "home名稱",
    "away": "away名稱",
    "spread": {
      "predict": "home",
      "handicap_id": "34452138",
      "handicap": 7.5,
      "percentage": 50,
      "bets": 1
    },
    "totals": {
      "predict": "over",
      "handicap_id": "34452138",
      "handicap": 217.5,
      "percentage": 50,
      "bets": 1
    }
  },
  {
    "bets_id": "2121183",
    "scheduled": "",
    "league": "NBA",
    "home": "home名稱",
    "away": "away名稱",
    "spread": {
      "predict": "home",
      "handicap_id": "31235571",
      "handicap": 11,
      "percentage": 50,
      "bets": 2
    },
    "totals": {
      "predict": "over",
      "handicap_id": "31235571",
      "handicap": 206,
      "percentage": 50,
      "bets": 2
    }
  }
]
 *
 * @apiError 301 User does not have predictions info
 * 
 * @apiErrorExample {JSON} 301-Response
 * HTTP/1.1 301 User does not have predictions info.
 * {
    "code": 301,
    "error": "User does not have predictions info."
 * }
 *
 * @apiError 302 User cant not own predictions more than one predictions of one day
 * 
 * @apiErrorExample {JSON} 302-Response
 * HTTP/1.1 302 User cant not own predictions more than one predictions of one day.
 * {
    "code": 302,
    "error": "User cant not own predictions more than one predictions of one day."
 * }
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
