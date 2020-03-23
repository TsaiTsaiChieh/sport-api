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
    res.status(err.code).json(err.err);
  }
}

module.exports = predictInfo;
/**
 * @api {get} /predictionInfo Get Prediction Info
 * @apiVersion 1.0.0
 * @apiName predictionInfo
 * @apiGroup User
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
 * @apiSuccess {JSON} result Available User Prediction Info
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
[
  {
    "bets_id": "2114519",
    "scheduled": {
      "_seconds": 1583967600,
      "_nanoseconds": 0
    },
    "league": "NBA",
    "home": "76人",
    "away": "活塞",
    "spread": {
      "predict": "home",
      "handicap_id": "31267231",
      "handicap": 11.5,
      "percentage": 50,
      "bets": 3
    },
    "totals": {
      "predict": "under",
      "handicap_id": "34409340",
      "handicap": 214.5,
      "percentage": 50,
      "bets": 1
    }
  },
  {
    "bets_id": "2115973",
    "scheduled": {
      "_seconds": 1583969400,
      "_nanoseconds": 0
    },
    "league": "NBA",
    "home": "熱火",
    "away": "黃蜂",
    "spread": {
      "predict": "home",
      "handicap_id": "31268919",
      "handicap": 10.5,
      "percentage": 50,
      "bets": 3
    },
    "totals": {
      "predict": "under",
      "handicap_id": "34417671",
      "handicap": 210.5,
      "percentage": 50,
      "bets": 1
    }
  },
  {
    "bets_id": "2117403",
    "scheduled": {
      "_seconds": 1583884800,
      "_nanoseconds": 0
    },
    "league": "NBA",
    "home": "火箭",
    "away": "灰狼",
    "spread": {
      "predict": "away",
      "handicap_id": "31194971",
      "handicap": 12.5,
      "percentage": 50,
      "bets": 1
    },
    "totals": {}
  },
  {
    "bets_id": "2117404",
    "scheduled": {
      "_seconds": 1583893800,
      "_nanoseconds": 0
    },
    "league": "NBA",
    "home": "勇士",
    "away": "快艇",
    "spread": {},
    "totals": {
      "predict": "under",
      "handicap_id": "34334768",
      "handicap": 226.5,
      "percentage": 50,
      "bets": 2
    }
  }
]
 *
 * @apiError 404 
 * 
 * @apiErrorExample {JSON} Error-1301
 * HTTP/1.1 404 Not Found
 * {
    "errcode": "1301",
    "errmsg": "User does not exist. Please sign in again"
 * }
 *
 * @apiError 404 
 * 
 * @apiErrorExample {JSON} Error-1302
 * HTTP/1.1 404 Not Found
 * {
    "errcode": "1302",
    "errmsg": "使用者不是一般使用者、大神，請確認使用者狀態"
 * }
 *
 * @apiError 404 
 * 
 * @apiErrorExample {JSON} Error-1303
 * HTTP/1.1 404 Not Found
 * {
    "errcode": "1303",
    "errmsg": "User does not have predictions info."
 * }
 *
 * @apiError 404 
 * 
 * @apiErrorExample {JSON} Error-1304
 * HTTP/1.1 404 Not Found
 * {
    "errcode": "1304",
    "errmsg": "User cant not own predictions more than one predictions of one day."
 * }
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 * 
 */
