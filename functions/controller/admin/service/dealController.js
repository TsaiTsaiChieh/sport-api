/* eslint-disable promise/always-return */
const modules = require('../../../util/modules');
const model = require('../../../model/admin/service/dealModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      article_id: {
        type: 'integer'
      },
      report_id: {
        type: 'integer'
      },
      type: {
        type: 'string',
        enum: ['article', 'reply']
      },
      status: { // 處理狀態
        type: 'string',
        enum: ['1', '2', '3', '9']
      },
      article_status: { // 文章狀態
        type: 'string',
        enum: ['1', '2', '3', '-1', '-2']
      },
      reply: {
        type: ['string', 'null']
      },
      blobkuid: {
        type: 'string'
      },
      blobkuser: {
        type: 'boolean'
      }
    },
    required: ['report_id', 'status']
  };
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    // console.log(modules.ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < modules.ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + modules.ajv.errors[i].dataPath + '\': ' + modules.ajv.errors[i].message);
    }
    res.status(400).json({ code: 400, error: 'schema not acceptable', message: ajv_errs });
    return;
  }
  // req.body.token = req.token;
  const args = req.body;

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = controller;
/**
 * @api {POST} /admin/service/deal/ deal
 * @apiName deal
 * @apiGroup Admin
 * @apiDescription 處決檢舉
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} [article_id] 文章ID
 * @apiParam {Integer} [report_id] 留言ID
 * @apiParam {String} type 文章還是留言[`article`, `reply`]
 * @apiParam {Integer} status 處理狀態[`1`待處理,`2`處理中,`3`擱置中,`9`已處理]
 * @apiParam {Integer} article_status 文章狀蓋[`1`正常,`2`(文章)鎖定回覆,`3`(文章)不顯示在文章列表,`-1`使用者刪除,`-2`管理員刪除]
 * @apiParam {String} reply 客服意見
 * @apiParam {Boolean} blobkuser 是否禁言user
 * @apiParamExample {JSON} Request-Example
 * {
 *   "article_id": 161,
 *   "type": "article",
 *   "status": 9,
 *   "article_status": -1,
 *   "reply": "我沒意見",
 *   "blobkuser": true,
 * }
 */
