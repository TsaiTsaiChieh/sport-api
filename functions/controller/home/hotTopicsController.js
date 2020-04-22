/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/home/hotTopicsModel');
async function getTopics(req, res) {
  if(typeof req.params.page !== 'undefined' && req.params.page !== '0' && req.params.page !== '1'){
    res.status(404).json('page error');
    return;
  }
  topicModel(req)
  .then(function(body) {
    res.json(body);
  })
  .catch(function(err) {
    res.status(err.code).json(err);
  });
}
module.exports = getTopics;
/**
 * @api {post} /topics/createTopic getTopics
 * @apiName getTopics
 * @apiVersion 1.1.0
 * @apiDescription 取得討論區文章
 * @apiGroup Topics
 * @apiPermission no
 *
 * @apiParam (Request header)       Bearer token generate from firebase Admin SDK
 * @apiParam {String} type          現在只支援 [NBA,MLB]
 * @apiParam {String} category      現在只支援 [賽事分析,球隊討論,投注分享]
 * @apiParam {Number} page          頁數
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *    "type": "MLB",
 *	  "category": "賽事分析",
 *    "page": 0
 * }
 */
