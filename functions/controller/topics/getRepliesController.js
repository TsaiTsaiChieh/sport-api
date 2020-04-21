/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const repliesModel = require('../../model/topics/getRepliesModel');
async function getTopics(req, res) {
  const aid = Number(req.params.aid);
  const page = Number(req.params.page);
  if(isNaN(aid) || !Number.isInteger(aid) || aid < 0 || aid > 9999999){
    res.status(403).send('param error');
    return;
  }
  if(isNaN(page) || !Number.isInteger(page) || page < 0 || page > 9999999){
    res.status(403).send('param error');
    return;
  }
  repliesModel({ aid: aid, page: page })
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