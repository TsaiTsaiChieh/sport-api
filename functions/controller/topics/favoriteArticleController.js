/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/topics/favoriteArticleModel');
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

module.exports = likeArticle;
/**
 * @api {GET} /topics/favoriteArticle/
 * @apiName favoriteArticle
 * @apiGroup Topics
 * @apiVersion 1.0.0
 * @apiDescription 收藏文章 by ifyu
 *
 * @apiParamExample {JSON} Request-Example
 * {
    "article_id": 124,
    "like": false
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
    "error": "this article has been favorite"
   }
 */
