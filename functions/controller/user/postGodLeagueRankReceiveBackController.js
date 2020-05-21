const postGodLeagueRankReceiveBackModel = require('../../model/user/postGodLeagueRankReceiveBackModel');

async function postGodLeagueRankReceiveBack(req, res) {
  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await postGodLeagueRankReceiveBackModel(req.body));
  } catch (err) {
    console.error(err);
    res.status(err.code).json(err.err);
  }
}

module.exports = postGodLeagueRankReceiveBack;
/**
 * @api {post} /god_league_rank_receive_back Post God League Rank Receive Back
 * @apiVersion 1.0.0
 * @apiName god_league_rank_receive_back
 * @apiGroup User
 * @apiPermission None
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} league shwo league
 * @apiSuccess {JSON} result success update object
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
