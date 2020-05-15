const { ajv } = require('../../util/modules');
const postGodLeagueRankReceiveModel = require('../../model/user/postGodLeagueRankReceiveModel');

async function postGodLeagueRankReceive(req, res) {
  const schema = {
    type: 'object',
    required: ['leagues'],
    properties: {
      leagues: {
        type: 'array',
        items: {
          allOf: [
            {
              type: 'string',
              enum: ['NBA', 'MLB', 'eSoccer', 'KBO'] // 目前測試資料和 modules.acceptLeague 不一致
            }
          ]
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

    res.json(await postGodLeagueRankReceiveModel(req.body));
  } catch (err) {
    console.error(err);
    res.status(err.code).json(err.err);
  }
}

module.exports = postGodLeagueRankReceive;
/**
 * @api {post} /god_league_titles Get God League Rank Receive
 * @apiVersion 1.0.0
 * @apiName god_league_rank
 * @apiGroup User
 * @apiPermission None
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league shwo league
 * @apiSuccess {JSON} result Available User Predict Info
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "success": [
    "NBA",
    "MLB"
  ]
}
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
