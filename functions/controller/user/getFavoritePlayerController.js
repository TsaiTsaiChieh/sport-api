const model = require('../../model/user/getFavoritePlayerModel');
async function favoriteGod(req, res) {
  req.body.token = req.token;
  req.body.god_uid = req.params.god_uid;
  const args = req.body;
  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = favoriteGod;
/**
 * @api {GET} /topics/getFavoritePlayer/:page getFavoritePlayer
 * @apiName getFavoritePlayer
 * @apiDescription 取得最愛玩家的追蹤聯盟
 * @apiGroup User
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200,
 *   "result": [
 *     "NBA",
 *     "CPBL"
 *   ]
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
