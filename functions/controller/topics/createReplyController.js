/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
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
        items: [
          { type: 'object' },
          { type: 'object' },
          { type: 'object' }
        ]
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
 * @api {GET} /topics/createReply/
 * @apiName createReply
 * @apiGroup Topics
 * @apiVersion 1.0.0
 * @apiDescription 回覆文章 by ifyu
 *
 * @apiParamExample {JSON} Request-Example
 * {
    "article_id": 116,
    "replyto_id": null,
    "content": "aaaaa"
   }
 *
 * @apiSuccess {String} response
 * {
    "code": 200
   }
 * @apiErrorExample 400-Response
 * HTTP/1.1 400 Bad Request
 * schema not acceptable
 *
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
   }
 */
