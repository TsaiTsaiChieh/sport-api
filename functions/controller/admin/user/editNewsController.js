/* eslint-disable promise/always-return */
const modules = require('../../../util/modules');
const model = require('../../../model/admin/user/editNewsModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['new', 'del', 'edit']
      },
      news_id: {
        type: 'integer'
      },
      uid: {
        type: 'string'
      },
      content: {
        type: 'string'
      }
    },
    required: ['method']
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
 * @api {POST} /admin/user/editNews/ editNews
 * @apiName editNews
 * @apiGroup Admin
 * @apiDescription 編輯通知
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} uid 使用者UID
 * @apiParam {String} method 方式 [`new`, `del`, `edit`]
 * @apiParam {Integer} [news_id] 編輯或刪除的ID
 * @apiParam {String} [content] content
 * @apiParamExample {JSON} Request-Example
 * {
 *   "method": "new",
 *   "content": "入鏡！入鏡！"
 * }
 */
