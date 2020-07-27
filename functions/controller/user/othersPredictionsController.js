const ajv = require('../../util/ajvUtil');
const { acceptNumberAndLetter } = require('../../config/acceptValues');
const othersPredicitionsModel = require('../../model/user/othersPredicitionsModel');

async function othersPredicitions(req, res) {
  const schema = {
    required: ['uid'],
    type: 'object',
    properties: {
      uid: {
        type: 'string',
        pattern: acceptNumberAndLetter
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.othersUid = req.body.uid; // 取得 需要查詢 使用者/大神 uid
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await othersPredicitionsModel(req.body));
  } catch (err) {
    console.error('[othersPredicitionsController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = othersPredicitions;
/**
 * @api {get} /others_predictions Get Others User/God Predictions
 * @apiVersion 1.0.0
 * @apiName Get Others User/God Predictions
 * @apiGroup User
 * @apiPermission None
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league shwo league
 * @apiSuccess {JSON} result Others User/God Predictions
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "begin": 1590681600,
  "end": 1590767999,
  "NBA": {
    "info": {
      "paid_type": "unpaid",
      "info": "啊我要來寫說明文啦～",
      "tips": "",
      "rank": 2,
      "title": {
        "2": [
          28,
          2189,
          1028
        ]
      }
    },
    "predictions": [
      {
        "bets_id": "2118810",
        "scheduled": 1593572400,
        "league": "NBA",
        "home": {
          "team_name": "SAC",
          "alias": "SAC",
          "alias_ch": "國王",
          "player_name": null
        },
        "away": {
          "team_name": "NOP",
          "alias": "NOP",
          "alias_ch": "鵜鶘",
          "player_name": null
        },
        "spread": {
          "predict": "",
          "spread_id": "31235573",
          "handicap": -1.5,
          "home_tw": "",
          "away_tw": "1輸",
          "bets": ""
        },
        "totals": {
          "predict": "",
          "totals_id": "34458529",
          "handicap": "232",
          "over_tw": "192",
          "bets": ""
        }
      },
      {
        "bets_id": "2118809",
        "scheduled": 1593574200,
        "league": "NBA",
        "home": {
          "team_name": "MEM",
          "alias": "MEM",
          "alias_ch": "灰熊",
          "player_name": null
        },
        "away": {
          "team_name": "ORL",
          "alias": "ORL",
          "alias_ch": "魔術",
          "player_name": null
        },
        "spread": {
          "predict": "",
          "spread_id": "31236860",
          "handicap": 2,
          "home_tw": "2平",
          "away_tw": "",
          "bets": ""
        },
        "totals": {
          "predict": "",
          "totals_id": "34364723",
          "handicap": "218",
          "over_tw": "192",
          "percentage": 0,
          "bets": ""
        }
      },
      {
        "bets_id": "2115973",
        "scheduled": 1593655200,
        "league": "NBA",
        "home": {
          "team_name": "MIA",
          "alias": "MIA",
          "alias_ch": "熱火",
          "player_name": null
        },
        "away": {
          "team_name": "CHA",
          "alias": "CHA",
          "alias_ch": "黃蜂",
          "player_name": null
        },
        "spread": {
          "predict": "away",
          "spread_id": "31268919",
          "handicap": 10.5,
          "home_tw": "10輸",
          "away_tw": "",
          "bets": 1
        },
        "totals": {
          "predict": "over",
          "totals_id": "34417671",
          "handicap": "210.5",
          "over_tw": "192",
          "percentage": 0,
          "bets": 1
        }
      },
      {
        "bets_id": "2114519",
        "scheduled": 1593658800,
        "league": "NBA",
        "home": {
          "team_name": "PHI",
          "alias": "PHI",
          "alias_ch": "76人",
          "player_name": null
        },
        "away": {
          "team_name": "DET",
          "alias": "DET",
          "alias_ch": "活塞",
          "player_name": null
        },
        "spread": {
          "predict": "away",
          "spread_id": "31267231",
          "handicap": 11.5,
          "home_tw": "11輸",
          "away_tw": "",
          "bets": 1
        },
        "totals": {
          "predict": "over",
          "totals_id": "34409340",
          "handicap": "214.5",
          "over_tw": "192",
          "percentage": 0,
          "bets": 1
        }
      }
    ]
  }
}
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "required",
    "dataPath": "",
    "schemaPath": "#/required",
    "params": {
      "missingProperty": "uid"
    },
    "message": "should have required property 'uid'"
  }
]
 *
 *
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
