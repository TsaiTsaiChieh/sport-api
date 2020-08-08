const getGodLeagueRankModel = require('../../model/user/getGodLeagueRankModel');

async function getGodLeagueRank(req, res) {
  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await getGodLeagueRankModel(req.body));
  } catch (err) {
    console.error('[getGodLeagueRankController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = getGodLeagueRank;
/**
 * @api {get} /god_league_titles Get God League Rank
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
  "titleAnimate": {
    "period": 5,
    "NBA": 2
  }
}
 *
 * @apiError 404
 *
 *
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *
 */
