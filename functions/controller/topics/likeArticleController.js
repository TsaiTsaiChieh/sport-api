/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/likeArticleModel');
async function likeArticle(req, res) {
/// 聯盟、看板、標題、文章（html格式）
  // content:{
  //   category: category, [賽事分析,球隊討論,投注分享]
  //   type: type, [MLB,NBA]
  //   title: title,
  //   content: content,
  // },

  const schema = {
    type: 'object',
    requied: ['category', 'type', 'title', 'content'],
    properties: {
      article_id: {
        type: 'integer',
        maximum: 9999999,
        minimum: 0
      },
      like: {
        type: 'boolean'
      }
    }
  };

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

module.exports = likeArticle;
/**
 * @api {post} /topics/createTopic createTopic
 * @apiName createTopic
 * @apiVersion 1.1.0
 * @apiDescription 新增討論區文章
 * @apiGroup Topics
 * @apiPermission login user with completed data
 *
 * @apiParam (Request header)       Bearer token generate from firebase Admin SDK
 * @apiParam {String} type          現在只支援 [NBA,MLB]
 * @apiParam {String} category      現在只支援 [賽事分析,球隊討論,投注分享]
 * @apiParam {String} title         標題
 * @apiParam {String} content       內容 支援部分html格式
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *    "type": "MLB",
 *	  "category": "賽事分析",
 *	  "title": "標題",
 *	  "content": "內容"
 * }
 *
 * @apiSuccess {Number} type          status code
 * @apiSuccess {Object} article_id    儲存後得到的文章id
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
 *    "code": 200,
 *    "article_id": 119
 * }
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 */
