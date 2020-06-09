const modules = require('../../util/modules');
const model = require('../../model/user/deletePredictsModel');

// eslint-disable-next-line consistent-return
async function deletePredictions(req, res) {
  const now = Date.now();
  const spreadSchema = {
    spread: {
      type: 'string',
      pattern: modules.acceptNumberAndLetter
    }
  };
  const totalsSchema = {
    totals: {
      type: 'string',
      pattern: modules.acceptNumberAndLetter
    }
  };

  const schema = {
    type: 'object',
    required: ['league', 'matches'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      },
      matches: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id'],
          maxItems: 30,
          anyOf: [
            {
              type: 'object',
              required: ['spread']
            },
            {
              type: 'object',
              required: ['totals']
            }
          ],
          properties: {
            id: {
              type: 'string',
              pattern: modules.acceptNumberAndLetter
            },
            spread: spreadSchema,
            totals: totalsSchema
          }
        }
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(modules.ajv.errors);
  }
  req.body.token = req.token;
  req.body.now = now;
  try {
    res.json(await model(req.body));
  } catch (err) {
    console.error(
      'Error in controller/user/deletePredictions by TsaiChieh',
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

module.exports = deletePredictions;

/**
 * @api {delete} /user/predictions Predict Matches
 * @apiVersion 1.0.0
 * @apiDescription Normal user delete own prediction form by Tsai-Chieh
 * @apiName Delete own prediction form
 * @apiGroup User
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league league name, the value enum are: `NBA`, `eSoccer`, `KBO`
 * @apiParam {Array} matches prediction form
 * @apiParam {String} matches.id match id
 * @apiParam {String} [matches.spread] spread id
 * @apiParam {String} [matches.totals] totals id
 *
 * @apiParamExample {JSON} Request-Example
{
	"league":"NBA",
	"matches":[
		{ "id": "2120643", "spread":"31298793" },
		{ "id": "2120643", "totals":"34456538" }
    ]
}
 * @apiSuccess {Array} success succeeded prediction
 * @apiSuccess {String} success.id match id which is successful
 * @apiSuccess {Array} [success.spread] spread[0] spread information array which is successful
 * @apiSuccess {Array} [success.totals] totals[0] totals information array which is successful
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
{
    "failed": [
        {
            "id": "2120646",
            "totals": "ss",
            "home": {
                "id": "58479",
                "alias": "DAL",
                "alias_ch": "獨行俠"
            },
            "away": {
                "id": "54278",
                "alias": "DEN",
                "alias_ch": "金塊"
            },
            "league_id": 2274,
            "code": 403,
            "error": "Match id: 2120646 in NBA already started or ended"
        },
        {
            "id": "212064x6",
            "totals": "ss",
            "code": 404,
            "error": "Match id: 212064x6 in NBA not found"
        }
    ],
    "success": [
        {
            "id": "2120643",
            "spread": "31298793",
            "home": {
                "id": "52891",
                "alias": "OKC",
                "alias_ch": "雷霆"
            },
            "away": {
                "id": "55289",
                "alias": "UTA",
                "alias_ch": "爵士"
            }
        },
        {
            "id": "2120643",
            "totals": "34456538",
            "home": {
                "id": "52891",
                "alias": "OKC",
                "alias_ch": "雷霆"
            },
            "away": {
                "id": "55289",
                "alias": "UTA",
                "alias_ch": "爵士"
            }
        }
    ]
}

 * @apiError 200 OK (but maybe failed)
 * @apiError 400 Bad Request
 * @apiError 403 Forbidden
 *
 * @apiErrorExample {JSON} 200-Response
 * {
    "error": "DeletePredictionsFailed",
    "devcode": 1001,
    "message": {
        "failed": [
            {
                "id": "2120646",
                "totals": "ss",
                "home": {
                    "id": "58479",
                    "alias": "DAL",
                    "alias_ch": "獨行俠"
                },
                "away": {
                    "id": "54278",
                    "alias": "DEN",
                    "alias_ch": "金塊"
                },
                "league_id": 2274,
                "code": 403,
                "error": "Match id: 2120646 in NBA already started or ended"
            },
            {
                "id": "212064x6",
                "totals": "ss",
                "code": 404,
                "error": "Match id: 212064x6 in NBA not found"
            },
            {
                "id": "2120643",
                "spread": "31298793",
                "home": {
                    "id": "52891",
                    "alias": "OKC",
                    "alias_ch": "雷霆"
                },
                "away": {
                    "id": "55289",
                    "alias": "UTA",
                    "alias_ch": "爵士"
                },
                "league_id": 2274,
                "code": 404,
                "error": "spread id: 31298793 in NBA not found"
            },
            {
                "id": "2120643",
                "totals": "34456538",
                "home": {
                    "id": "52891",
                    "alias": "OKC",
                    "alias_ch": "雷霆"
                },
                "away": {
                    "id": "55289",
                    "alias": "UTA",
                    "alias_ch": "爵士"
                },
                "league_id": 2274,
                "code": 404,
                "error": "totals id: 34456538 in NBA not found"
            }
        ]
    }
}
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
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
