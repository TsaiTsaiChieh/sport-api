const model = require('../../model/home/bannerContentModel');
async function bannerContent(req, res) {
  let id = Number(req.params.id);
  if (isNaN(id) || !Number.isInteger(id) || id < 0 || id > 9999999) {
    res.status(400).json({ error: 'no id' });
    return;
  } else {
    id = Number(req.params.id);
  }
  model({ req: req, id: id })
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = bannerContent;
/**
 * @api {GET} /home/bannerContent/:id bannerContent
 * @apiName bannerContent
 * @apiDescription 取得首頁活動廣告內容
 * @apiGroup Home
 * @apiParam {Number} page          頁數 (必填, 從`0`開始)
 * @apiErrorExample {JSON} (404-Response) ID Not Found or Exipred
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 404,
 *   "error": "id not found or expired"
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
