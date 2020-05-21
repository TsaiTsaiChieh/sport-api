const model = require('../../model/home/bannerImageModel');
async function bannerImage(req, res) {
  model(req)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = bannerImage;
/**
 * @api {GET} /home/bannerImage/
 * @apiName bannerContent
 * @apiDescription 取得首頁活動廣告圖
 * @apiGroup Home
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
