/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/createTopicModel');
const types = require('./types');
async function createTopic(req, res) {
  const league = types.getLeague();
  const category = types.getCategory();

  const schema = {
    type: 'object',
    required: ['category', 'league', 'title', 'content'],
    properties: {
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

module.exports = createTopic;
/**
 * @api {POST} /topics/createTopic/
 * @apiName createTopic
 * @apiGroup Topics
 * @apiDescription 新增討論區文章
 * @apiPermission login user with completed data
 * @apiParam (Request header)       Bearer token generate from firebase Admin SDK
 * @apiParam {String} league        league_id (參考/topics/types/)
 * @apiParam {Integer} category     category_id (參考/topics/types/)
 * @apiParam {String} title         標題
 * @apiParam {String} content       內容 支援部分html格式
 * {
 * 	 "league": "MLB",
 * 	 "category": 2,
 *   "title": "title",
 *   "content": "測試123"
 * }
 *
 * @apiSuccess {JSON} response
 * {
 *   "code": 200,
 *   "article_id": 192
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
 *
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
