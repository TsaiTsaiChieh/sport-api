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
      },
      imgurl: {
        type: 'string',
        maxLength: 255,
        format: 'url'
      }
    }
  };

  if (req.body.category === 3) schema.content.minLength = 50;

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
 * @api {GET} /topics/editArticle/ editArticle
 * @apiName editArticle
 * @apiGroup Topics
 * @apiDescription 編輯文章
 * @apiPermission login user with completed data, article author is current user
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} article_id   文章ID
 * @apiParamExample {JSON} Request-Example
 *    與createTopic相同
 *
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200
 * }
 * @apiErrorExample {JSON} (400-Response) Schema Error
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 400,
 *   "error": "schema not acceptable",
 *   "message": [
 *     "ajv error message"
 *   ]
 * }
 * @apiErrorExample {JSON} (403-Response) Not Current User's Article
 * HTTP/1.1 403 Forbidden
 * {
 *   "code": 403,
 *   "error": "not your article"
 * }
 * @apiErrorExample {JSON} (404-Response) Article Not Found
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 404,
 *   "error": "article not found"
 * }
 *
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
