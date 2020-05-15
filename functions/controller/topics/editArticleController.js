/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/editArticleModel');
const types = require('./types');
async function editArticle(req, res) {
/// 聯盟、看板、標題、文章（html格式）
  // content:{
  //   category: category, [賽事分析,球隊討論,投注分享]
  //   type: type, [MLB,NBA]
  //   title: title,
  //   content: content,
  // },
  const league = types.getLeague();
  const category = types.getCategory();

  const schema = {
    type: 'object',
    required: ['category', 'league', 'title', 'content'],
    properties: {
      article_id: {
        type: 'integer',
        maximum: 9999999,
        minimum: 0
      },
      league: {
        type: 'string',
        enum: league
      },
      category: {
        type: 'integer',
        enum: category
      },
      title: {
        type: 'string',
        maxLength: 50
      },
      content: {
        type: 'string'
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    console.log(modules.ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < modules.ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + modules.ajv.errors[i].dataPath + '\': ' + modules.ajv.errors[i].message);
    }
    res.status(400).json({ code: 400, error: 'schema not acceptable', message: ajv_errs });
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

module.exports = editArticle;
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
 *    "article_id": 123,
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
 *    "code": 200
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
