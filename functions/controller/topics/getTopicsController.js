/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/getTopicsModel');
async function getTopics(req, res) {
  const schema = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['MLB', 'NBA']
      },
      category: {
        type: 'string',
        enum: ['賽事分析', '球隊討論', '投注分享']
      },
      page: {
        type: 'integer',
        maximum: 99999,
        minimum: 0
      }
    }
  }

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  req.body.token = req.token;
  const args = req.body;
  
  topicModel(args)
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