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
 * @api {GET} /topics/getFavoriteArticle/:page
 * @apiName getFavoriteArticle
 * @apiDescription 取得我最愛的玩家的聯盟
 * @apiGroup User
 * @apiSuccess {JSON} response
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
