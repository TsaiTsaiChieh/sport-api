const getGodLeagueRankDefaultLeagueModel = require('../../model/user/getGodLeagueRankDefaultLeagueModel');

async function getGodLeagueRankDefaultLeague(req, res) {
  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await getGodLeagueRankDefaultLeagueModel(req.body));
  } catch (err) {
    console.error(err);
    res.status(err.code).json(err.err);
  }
}

module.exports = getGodLeagueRankDefaultLeague;
/**
 * @api {get} /god_league_rank_default_league Get God League Rank Default League
 * @apiVersion 1.0.0
 * @apiName god_league_rank default league
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
  "default_league_rank": "NBA",
  "NBA": {
    "rank": 2,
    "title": {
      "1": 5
    }
  },
  "MLB": {
    "rank": 2,
    "title": {
      "1": 0
    }
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
