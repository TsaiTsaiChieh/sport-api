const { ajv, acceptLeague } = require('../../util/modules');
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
              enum: acceptLeague
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
    console.error('[postGodLeagueRankReceiveController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = postGodLeagueRankReceive;
/**
 * @api {post} /god_league_rank_receive Post God League Rank Receive
 * @apiVersion 1.0.0
 * @apiName god_league_rank_receive
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
