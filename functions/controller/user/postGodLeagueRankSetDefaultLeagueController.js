const { ajv } = require('../../util/modules');
const postGodLeagueRankSetDefaultLeagueModel = require('../../model/user/postGodLeagueRankSetDefaultLeagueModel');

async function postGodLeagueRankSetDefaultLeague(req, res) {
  const schema = {
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB', 'eSoccer', 'KBO']
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    return res.status(400).json(ajv.errors);
  }

  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await postGodLeagueRankSetDefaultLeagueModel(req.body));
  } catch (err) {
    console.error(err);
    res.status(err.code).json(err.err);
  }
}

module.exports = postGodLeagueRankSetDefaultLeague;
/**
 * @api {post} /god_league_titles Post God League Rank Set Default League
 * @apiVersion 1.0.0
 * @apiName god_league_rank_set_default_league
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
    "2WMRgHyUwvTLyHpLoANk7gWADZn1"
  ]
}
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
      "missingProperty": "league"
    },
    "message": "should have required property 'league'"
  }
]
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
