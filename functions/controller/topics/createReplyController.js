/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const replyModel = require('../../model/topics/createReplyModel');
async function createTopic (req, res) {
// content:{
  //   category: category, [賽事分析,球隊討論,投注分享]
  //   type: type, [MLB,NBA]
  //   title: title,
  //   content: content,
  // },

  const schema = {
    type: 'object',
    requied: ['aid', 'content'],
    properties: {
      aid: {
        type: 'number'
      },
      reply_id: {
        type: ['number', 'null']
      },
      content: {
        type: 'string'
      },
      images: {
        type: 'array',
        maxItems: 3,
        items: [
          { type: 'object' },
          { type: 'object' },
          { type: 'object' }
        ]
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

  replyModel(args)
    .then(function (body) {
      res.json(body);
    })
    .catch(function (err) {
      res.status(err.code).json(err);
    });
}

module.exports = createTopic;
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
