const godlistsLeaguesModel = require('../../model/rank/godListsLeaguesModel');

async function godlistsLeagues (req, res) {
  try {
    res.json(await godlistsLeaguesModel());
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = godlistsLeagues;
/**
 * @api {get} /rank/godlistsLeagues Get God Lists Exist League
 * @apiVersion 1.0.0
 * @apiName godlistsLeagues
 * @apiGroup rank
 *
 * @apiSuccess {JSON} result Available League List of God lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
[
  "NBA",
  "MLB"
]
*
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "msg": {}
}
 */
