const modules = require('../../util/modules');
const model = require('../../model/user/_predictMatchesModel');

// eslint-disable-next-line consistent-return
async function predictMatches(req, res) {
  const now = Date.now();
  const spreadSchema = {
    type: 'array',
    items: [
      { type: 'string' },
      { type: 'string', enum: ['home', 'away'] },
      { type: 'integer', minimum: 1, maximum: 3 }
    ]
  };
  const totalsSchema = {
    type: 'array',
    items: [
      { type: 'string' },
      { type: 'string', enum: ['over', 'under'] },
      { type: 'integer', minimum: 1, maximum: 3 }
    ]
  };
  const schema = {
    type: 'object',
    required: ['league', 'sell', 'matches'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA']
      },
      sell: {
        type: 'integer',
        enum: [0, 1]
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
              type: 'string'
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
      'Error in controller/user/predictMatchesController/predictMatches function by TsaiChieh',
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

module.exports = predictMatches;

/**
 * @api {post} /user/predict_matches_v2 Predict Matches
 * @apiVersion 2.0.0
 * @apiDescription User send own prediction form by Tsai-Chieh
 * @apiName Create or update own prediction form
 * @apiGroup User
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league league name, the value enum are: `NBA`
 * @apiParam {Number} sell 0: free, 1: sell, just god like user can sell
 * @apiParam {Array} matches prediction form
 * @apiParam {String} matches.id match id
 * @apiParam {String} [matches.spread] spread information array, spread[0] is spread id, spread[1] enum are: `home`, `away`, spread[2] is chip number, max is 3, min is 1
 * @apiParam {String} [matches.totals] totals information array, totals[0] is totals id, totals[1] enum are: `under`, `over`, totals[2] is chip number, max is 3, min is 1
 *
 * @apiParamExample {JSON} Request-Example
{
  "league": "NBA",
  "sell": 0,
	"matches": 
	[
		{
			"id": "34893434",
			"spread":["37843","home", 2]
		},
		{
			"id": "34893434",
			"totals": ["3435456", "over", 2]
		},
		{
			"id": "2114519",
			"spread": ["27833", "home", 3]
		},
		{
			"id": "2118810",
			"spread": ["3435456", "home", 2]
		},
		{
			"id": "2115973",
			"spread": ["31268919", "home", 3]
		},
		{
			"id": "2115973",
			"totals": ["34417671", "over", 2]
		}
		
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
    "failed": [],
    "success": [
        {
            "id": "2115973",
            "spread": [
                "31268919",
                "home",
                3
            ]
        },
        {
            "id": "2115973",
            "totals": [
                "34417671",
                "over",
                2
            ]
        }
    ]
}
* @apiSuccessExample {JSON} Success-Response
{
    "failed": [
        {
            "id": "2115973",
            "spread": [
                "31268919",
                "home",
                3
            ],
            "code": 403,
            "error": "Spread id: 31268919 OTB, forbidden"
        },
        {
            "id": "2118058",
            "totals": [
                "ssstest",
                "over",
                1
            ],
            "code": 403,
            "error": "Totals id: ssstest OTB, forbidden"
        },
        {
            "id": "2115973",
            "totals": [
                "null",
                "under",
                1
            ],
            "code": 403,
            "error": "Totals id: null conflict with the newest"
        }
    ],
    "success": [
        {
            "id": "2117403",
            "spread": [
                "31194971",
                "away",
                1
            ]
        },
        {
            "id": "2117404",
            "totals": [
                "34334768",
                "under",
                2
            ]
        },
        {
            "id": "2114519",
            "totals": [
                "34409340",
                "under",
                1
            ]
        }
    ]
}
 *
 * @apiError 400 Bad Request
 * @apiError 403 Forbidden
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
* @apiErrorExample {JSON} 403-Response
 * HTTP/1.1 403 Bad Request
 * {
    "error": "UserPredictFailed",
    "devcode": 1202
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
