const modules = require('../../util/modules');
const predictInfoModel = require('../../model/user/predictInfoModel');

async function predictInfo(req, res) {
  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await predictInfoModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = predictInfo;
/**
 * @api {get} /predictInfo Get Predic Info
 * @apiVersion 1.0.0
 * @apiName predictInfo
 * @apiGroup User
 * @apiPermission None
 * 
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league shwo league
 * 
 * 
 * @apiSuccess {JSON} result Available User Predict Info
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "NBA": [
    {
      "bets_id": "2115973",
      "scheduled": 1585627804000,
      "league": "NBA",
      "home": "CHA",
      "home_ch": "黃蜂",
      "spread": {
        "predict": "under",
        "handicap": 210.5,
        "percentage": 8,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2115973",
      "scheduled": 1585628027000,
      "league": "NBA",
      "home": "CHA",
      "home_ch": "黃蜂",
      "spread": {
        "predict": "under",
        "handicap": 210.5,
        "percentage": 16,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2117403",
      "scheduled": 1585628027000,
      "league": "NBA",
      "home": "MIN",
      "home_ch": "灰狼",
      "spread": {
        "predict": "away",
        "handicap": 12.5,
        "percentage": 17,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2114519",
      "scheduled": 1585714204000,
      "league": "NBA",
      "home": "PHI",
      "home_ch": "76人",
      "spread": {
        "predict": "under",
        "handicap": 214.5,
        "percentage": 10,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2114519",
      "scheduled": 1585714427000,
      "league": "NBA",
      "home": "PHI",
      "home_ch": "76人",
      "spread": {
        "predict": "under",
        "handicap": 214.5,
        "percentage": 11,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2117404",
      "scheduled": 1585714427000,
      "league": "NBA",
      "home": "GSW",
      "home_ch": "勇士",
      "spread": {
        "predict": "under",
        "handicap": 226.5,
        "percentage": 20,
        "bets": 2
      },
      "totals": {}
    },
    {
      "bets_id": "2117404",
      "scheduled": 1585800604000,
      "league": "NBA",
      "home": "GSW",
      "home_ch": "勇士",
      "spread": {
        "predict": "under",
        "handicap": 226.5,
        "percentage": 42,
        "bets": 2
      },
      "totals": {}
    },
    {
      "bets_id": "2117404",
      "scheduled": 1585800827000,
      "league": "NBA",
      "home": "GSW",
      "home_ch": "勇士",
      "spread": {
        "predict": "under",
        "handicap": 226.5,
        "percentage": 32,
        "bets": 2
      },
      "totals": {}
    }
  ],
  "MLB": [
    {
      "bets_id": "2115973",
      "scheduled": 1585628127000,
      "league": "MLB",
      "home": "CHA",
      "home_ch": "黃蜂",
      "spread": {
        "predict": "under",
        "handicap": 210.5,
        "percentage": 32,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2115973",
      "scheduled": 1585714383000,
      "league": "MLB",
      "home": "CHA",
      "home_ch": "黃蜂",
      "spread": {
        "predict": "under",
        "handicap": 210.5,
        "percentage": 32,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2117403",
      "scheduled": 1585714383000,
      "league": "MLB",
      "home": "MIN",
      "home_ch": "灰狼",
      "spread": {
        "predict": "away",
        "handicap": 12.5,
        "percentage": 28,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2114519",
      "scheduled": 1585714527000,
      "league": "MLB",
      "home": "PHI",
      "home_ch": "76人",
      "spread": {
        "predict": "under",
        "handicap": 214.5,
        "percentage": 8,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2115973",
      "scheduled": 1585714527000,
      "league": "MLB",
      "home": "CHA",
      "home_ch": "黃蜂",
      "spread": {
        "predict": "under",
        "handicap": 210.5,
        "percentage": 12,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2117403",
      "scheduled": 1585714527000,
      "league": "MLB",
      "home": "MIN",
      "home_ch": "灰狼",
      "spread": {
        "predict": "away",
        "handicap": 12.5,
        "percentage": 26,
        "bets": 1
      },
      "totals": {}
    },
    {
      "bets_id": "2117404",
      "scheduled": 1585800927000,
      "league": "MLB",
      "home": "GSW",
      "home_ch": "勇士",
      "spread": {
        "predict": "under",
        "handicap": 226.5,
        "percentage": 11,
        "bets": 2
      },
      "totals": {}
    }
  ]
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
 * @apiError 404 
 * 
 * @apiErrorExample {JSON} Error-1303
 * HTTP/1.1 404 Not Found
 * {
    "code": "1303",
    "msg": "使用者沒有預測單"
 * }
 *
 * @apiError 404 
 * 
 * @apiErrorExample {JSON} Error-1304
 * HTTP/1.1 404 Not Found
 * {
    "code": "1304",
    "msg": "使用者一天只能擁有一份預測清單"
 * }
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 * 
 */
