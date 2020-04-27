const modules = require('../../util/modules');
const model = require('../../model/user/predictionRateModel');

async function predictionRate(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'date', 'user_type'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'eSoccer']
      },
      date: {
        type: 'string',
        format: 'date'
      },
      user_type: {
        type: 'string',
        enum: ['all', 'god']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error(
      'Error in controller/user/predictRateController function by TsaiChieh',
      err
    );
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = predictionRate;
/**
 * @api {get} /user/prediction_rate get prediction rate
 * @apiVersion 1.0.0
 * @apiDescription User can observe each match of prediction rate with specific date and league by Tsai-Chieh
 * @apiName Get prediction rate
 * @apiGroup User
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league league name, the value enum are: `NBA`, `eSoccer`
 * @apiParam {String} date ex: `2020-07-01`
 * @apiParam {String} user_type ex: `all`(所有玩家), `god`(大神玩家)
 *
 * @apiParamExample {JSON} Request-Example
{
  "league": "NBA",
  "date"": "2020-07-01",
	"user_type": "all"
}
 * @apiSuccess {Array} success succeeded prediction
 * @apiSuccess {String} success.id match id which is successful
 * @apiSuccess {Array} [success.spread] spread[0] spread information array which is successful
 * @apiSuccess {Array} [success.totals] totals[0] totals information array which is successful
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
{
    "scheduled": [
        {
            "id": "2120643",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 3,
                "away": 0,
                "home_rate": "100%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 3,
                "over": 0,
                "under_rate": "100%",
                "over_rate": "0%"
            }
        },
        {
            "id": "2119917",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 2,
                "away": 0,
                "home_rate": "100%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 1,
                "over": 1,
                "under_rate": "50%",
                "over_rate": "50%"
            }
        },
        {
            "id": "2118817",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 0,
                "away": 0,
                "home_rate": "0%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 0,
                "over": 1,
                "under_rate": "0%",
                "over_rate": "100%"
            }
        },
        {
            "id": "2118816",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 0,
                "away": 0,
                "home_rate": "0%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 1,
                "over": 0,
                "under_rate": "100%",
                "over_rate": "0%"
            }
        },
        {
            "id": "2119439",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 1,
                "away": 0,
                "home_rate": "100%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 0,
                "over": 2,
                "under_rate": "0%",
                "over_rate": "100%"
            }
        },
        {
            "id": "2118810",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 2,
                "away": 1,
                "home_rate": "66%",
                "away_rate": "33%"
            },
            "totals": {
                "under": 2,
                "over": 1,
                "under_rate": "66%",
                "over_rate": "33%"
            }
        },
        {
            "id": "2118809",
            "status": 2,
            "league": "NBA",
            "spread": {
                "home": 0,
                "away": 3,
                "home_rate": "0%",
                "away_rate": "100%"
            },
            "totals": {
                "under": 2,
                "over": 1,
                "under_rate": "66%",
                "over_rate": "33%"
            }
        }
    ],
    "inplay": [
        {
            "id": "2120647",
            "status": 1,
            "league": "NBA",
            "spread": {
                "home": 0,
                "away": 0,
                "home_rate": "0%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 0,
                "over": 0,
                "under_rate": "0%",
                "over_rate": "0%"
            }
        },
        {
            "id": "2120646",
            "status": 1,
            "league": "NBA",
            "spread": {
                "home": 0,
                "away": 0,
                "home_rate": "0%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 0,
                "over": 0,
                "under_rate": "0%",
                "over_rate": "0%"
            }
        }
    ],
    "end": [
        {
            "id": "2118058",
            "status": 0,
            "league": "NBA",
            "spread": {
                "home": 1,
                "away": 0,
                "home_rate": "100%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 1,
                "over": 0,
                "under_rate": "100%",
                "over_rate": "0%"
            }
        },
        {
            "id": "2121183",
            "status": 0,
            "league": "NBA",
            "spread": {
                "home": 0,
                "away": 0,
                "home_rate": "0%",
                "away_rate": "0%"
            },
            "totals": {
                "under": 0,
                "over": 0,
                "under_rate": "0%",
                "over_rate": "0%"
            }
        }
    ]
}
 *
 * @apiError 400 Bad Request
 * @apiError 401 Bad Unauthorized
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "enum",
        "dataPath": ".user_type",
        "schemaPath": "#/properties/user_type/enum",
        "params": {
            "allowedValues": [
                "all",
                "god"
            ]
        },
        "message": "should be equal to one of the allowed values"
    }
]
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
