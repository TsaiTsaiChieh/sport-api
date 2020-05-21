/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/topics/deleteArticleModel');
async function deleteArticle(req, res) {
  const schema = {
    type: 'object',
    required: ['article_id'],
    properties: {
      article_id: {
        type: 'integer',
        maximum: 9999999,
        minimum: 0
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

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = deleteArticle;
/**
 * @api {GET} /topics/createReply/
 * @apiName deleteArticle
 * @apiGroup Topics
 * @apiDescription 刪除文章
 * @apiPermission login user with completed data
 * @apiParam (Request header)       Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} article_id   文章ID
 * @apiParamExample {JSON} Request-Example
 * {
 *   "article_id": 116
 * }
 *
 * @apiSuccess {JSON} response
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
 * @apiErrorExample {JSON} (404-Response) Not Current User's Article
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
