const ajv = require('../../util/ajvUtil');
const replyModel = require('../../model/topics/createReplyModel');
async function createTopic(req, res) {
  const schema = {
    type: 'object',
    required: ['article_id', 'content'],
    properties: {
      article_id: {
        type: 'number'
      },
      replyto_id: {
        type: ['number', 'null']
      },
      replyto_floor: {
        type: ['number', 'null']
      },
      content: {
        type: 'string'
      },
      images: {
        type: 'array',
        maxItems: 3,
        items: { type: 'object' }
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    console.warn(ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + ajv.errors[i].dataPath + '\': ' + ajv.errors[i].message);
    }
    res.status(400).json({ code: 400, error: 'schema not acceptable', message: ajv_errs });
    return;
  }
  req.body.token = req.token;
  const args = req.body;

  replyModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}

module.exports = createTopic;
/**
 * @api {GET} /topics/createReply/ createReply
 * @apiName createReply
 * @apiGroup Topics
 * @apiDescription 回覆文章
 * @apiPermission login user with completed data
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} article_id 文章ID
 * @apiParam {Integer} [replyto_id]  被引言的留言ID
 * @apiParam {String} [content]  內容
 * @apiParamExample {JSON} Request-Example
 * {
 *   "article_id": 116,
 *   "replyto_id": null,
 *   "content": "aaaaa"
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
 * @apiErrorExample {JSON} (404-Response) Article Not Found
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 404,
 *   "error": "topic not found"
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
