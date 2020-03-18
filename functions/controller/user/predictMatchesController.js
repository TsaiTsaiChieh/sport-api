const modules = require('../../util/modules');
const model = require('../../model/user/predictMatchesModel');

// eslint-disable-next-line consistent-return
async function predictMatches(req, res) {
  const now = Date.now();
  const schema = {
    type: 'object',
    required: ['league', 'matches'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA']
      },
      matches: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id'],
          anyOf: [{ required: ['spread'] }, { required: ['totals'] }],
          properties: {
            id: {
              type: 'string'
            },
            spread: {
              type: 'array',
              items: [
                { type: 'string' },
                { type: 'string', enum: ['home', 'away'] },
                { type: 'integer', minimum: 1, maximum: 3 }
              ]
            },
            totals: {
              type: 'array',
              item: [
                { type: 'string' },
                { type: 'string', enum: ['over', 'under'] },
                { type: 'integer', minimum: 1, maximum: 3 }
              ]
            }
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
    res.status(err.code).json(err);
  }
}

module.exports = predictMatches;

/**
 * @api {post} /predictMatches Predict Matches
 * @apiVersion 1.0.0
 * @apiDescription User send own prediction form by Tsai-Chieh
 * @apiName Create or update own prediction form
 * @apiGroup User
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league league name, the value enum are: `NBA`
 * @apiParam {Array} matches prediction form
 * @apiParam {String} matches.id match id
 * @apiParam {String} [matches.spread] spread information array, spread[0] is spread id, spread[1] enum are: `home`, `away`, spread[2] is chip number, max is 3, min is 1
 * @apiParam {String} [matches.totals] totals information array, totals[0] is totals id, totals[1] enum are: `under`, `over`, totals[2] is chip number, max is 3, min is 1
 *
 * @apiParamExample {JSON} Request-Example
{
	"league": "NBA",
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
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 404 Not Found
 * @apiError 405 Not Allowed
 * @apiError 406 Not Acceptable
 * @apiError 485 Own Definition
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
 * @apiErrorExample {JSON} 401-Response
 * HTTP/1.1 401 Unauthorized
 * {
    "code": 401,
    "error": "Unauthorized"
}
 * @apiErrorExample {JSON} 485-Response
 * HTTP/1.1 485 Own Definition
{
    "code": 485,
    "error": {
        "failed": [
            {
                "id": "34893434",
                "spread": [
                    "37843",
                    "home",
                    2
                ],
                "code": 404,
                "error": "Match id: 34893434 not found"
            },
            {
                "id": "34893434",
                "totals": [
                    "3435456",
                    "over",
                    2
                ],
                "code": 404,
                "error": "Match id: 34893434 not found"
            },
            {
                "id": "2114519",
                "spread": [
                    "27833",
                    "home",
                    3
                ],
                "code": 406,
                "error": "The Match id: 2114519 already start, not acceptable"
            },
            {
                "id": "2118810",
                "spread": [
                    "3435456",
                    "home",
                    2
                ],
                "code": 405,
                "error": "Spread id: 3435456 OTB, not allowed"
            }
        ],
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
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
