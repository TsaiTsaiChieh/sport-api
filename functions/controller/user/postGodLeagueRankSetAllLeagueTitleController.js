const { ajv, acceptLeague } = require('../../util/modules');
const postGodLeagueRankSetAllLeagueTitleModel = require('../../model/user/postGodLeagueRankSetAllLeagueTitleModel');

async function postGodLeagueRankSetAllLeagueTitle(req, res) {
  const schema = {
    type: 'object',
    required: ['titles'],
    properties: {
      titles: {
        type: 'array',
        items: {
          type: 'object',
          required: ['league', 'default_title'],
          properties: {
            league: {
              type: 'string',
              enum: acceptLeague
            },
            default_title: {
              type: 'integer',
              enum: [1, 2, 3, 4, 5, 6]
            }
          }
        }
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await postGodLeagueRankSetAllLeagueTitleModel(req.body));
  } catch (err) {
    console.error('[postGodLeagueRankSetAllLeagueTitleController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = postGodLeagueRankSetAllLeagueTitle;
/**
 * @api {post} /god_league_titles Post God League Rank Set All League Title
 * @apiVersion 1.0.0
 * @apiName god_league_rank_set_all_league_title
 * @apiGroup User
 * @apiPermission None
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league shwo league
 * @apiSuccess {JSON} result success update object
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "success": [
    {
      "league": "NBA",
      "default_title": 2
    },
    {
      "league": "MLB",
      "default_title": 4
    }
  ]
}
 *
 *
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "required",
    "dataPath": "",
    "schemaPath": "#/required",
    "params": {
      "missingProperty": "titles"
    },
    "message": "should have required property 'titles'"
  }
]
 *
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "required",
    "dataPath": ".titles[0]",
    "schemaPath": "#/properties/titles/items/required",
    "params": {
      "missingProperty": "league"
    },
    "message": "should have required property 'league'"
  }
]
 *
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "required",
    "dataPath": ".titles[0]",
    "schemaPath": "#/properties/titles/items/required",
    "params": {
      "missingProperty": "default_title"
    },
    "message": "should have required property 'default_title'"
  }
]
 *
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
  {
    "keyword": "enum",
    "dataPath": ".titles[0].league",
    "schemaPath": "#/properties/titles/items/properties/league/enum",
    "params": {
      "allowedValues": [
        "NBA",
        "MLB",
        "eSoccer",
        "KBO"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": ".titles[1].default_title",
    "schemaPath": "#/properties/titles/items/properties/default_title/enum",
    "params": {
      "allowedValues": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "message": "should be equal to one of the allowed values"
  }
]
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
