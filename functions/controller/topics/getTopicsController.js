/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/getTopicsModel');
const types = require('./types');
async function getTopics(req, res) {
  const league = types.getLeague();
  league.push(null);
  const category = types.getCategory();
  category.push(null);
  const schema = {
    type: 'object',
    properties: {
      uid: {
        type: ['string', 'null']
      },
      league: {
        type: ['string', 'null'],
        enum: league
      },
      category: {
        type: ['integer', 'null'],
        enum: category
      },
      count: {
        type: 'integer',
        maximum: 50,
        minimum: 0,
        default: 10
      },
      sortByLike: {
        type: 'boolean',
        default: false
      },
      page: {
        type: 'integer',
        maximum: 99999,
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

  topicModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
/**
 * @api {post} /topics/createTopic getTopics
 * @apiName getTopics
 * @apiVersion 1.1.0
 * @apiDescription 取得討論區文章
 * @apiGroup Topics
 * @apiPermission no
 *
 * @apiParam (Request header)       Bearer token generate from firebase Admin SDK
 * @apiParam {String} type          現在只支援 [NBA,MLB]
 * @apiParam {String} category      現在只支援 [賽事分析,球隊討論,投注分享]
 * @apiParam {Number} page          頁數
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *    "type": "MLB",
 *	  "category": "賽事分析",
 *    "page": 0
 * }
 */
