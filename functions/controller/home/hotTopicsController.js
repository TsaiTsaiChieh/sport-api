/* eslint-disable promise/always-return */
const model = require('../../model/home/hotTopicsModel');
async function getTopics(req, res) {
  let page = Number(req.params.page);
  if (isNaN(page) || !Number.isInteger(page) || page < 0 || page > 9999999) {
    page = null;
  } else {
    page = Number(req.params.page);
  }
  model({ page: page })
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
/**
 * @api {GET} /home/hotTopics hotTopics
 * @apiName hotTopics
 * @apiDescription 取得首頁熱門文章
 * @apiGroup Home
 * @apiParam {Number} page          頁數
 */
