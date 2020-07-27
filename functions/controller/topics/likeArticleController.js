const ajv = require('../../util/ajvUtil');
const model = require('../../model/topics/likeArticleModel');
async function likeArticle(req, res) {
  const schema = {
    type: 'object',
    required: ['article_id', 'like'],
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
  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    console.log(ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + ajv.errors[i].dataPath + '\': ' + ajv.errors[i].message);
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

module.exports = likeArticle;
/**
 * @api {GET} /topics/likeArticle/ likeArticle
 * @apiName likeArticle
 * @apiGroup Topics
 * @apiDescription 按讚文章
 * @apiPermission login user with completed data
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} article_id   文章ID
 * @apiParam {Boolean} like         `true`按讚, `false`收回讚
 * @apiParamExample {JSON} Request-Example
 * {
 *   "article_id": 124,
 *   "like": false
 * }
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
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": "this article has been liked"
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
