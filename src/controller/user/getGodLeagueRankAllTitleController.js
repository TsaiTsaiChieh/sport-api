const getGodLeagueRankAllTitleModel = require('../../model/user/getGodLeagueRankAllTitleModel');

async function getGodLeagueRankAllTitle(req, res) {
  try {
    req.body.token = req.token; // 從 cookie 取得 __session 中 token

    res.json(await getGodLeagueRankAllTitleModel(req.body));
  } catch (err) {
    console.error('[getGodLeagueRankAllTitleController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = getGodLeagueRankAllTitle;
/**
 * @api {get} /god_league_titles Get God League Rank Default Title
 * @apiVersion 1.0.0
 * @apiName god_league_rank default title
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
  "lists": {
    "NBA": {
      "rank": 2,
      "default_title": 1,
      "titles": {
        "1": 5,
        "2": [
          7,
          28,
          21
        ],
        "3": [
          7,
          21
        ],
        "4": 3,
        "5": [
          10,
          8
        ],
        "6": 10
      }
    },
    "MLB": {
      "rank": 2,
      "default_title": 1,
      "titles": {
        "1": 0,
        "2": [
          14,
          28,
          14
        ],
        "3": [
          14,
          14
        ],
        "4": 0,
        "5": [
          0,
          0
        ],
        "6": 1
      }
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
