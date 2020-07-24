const modules = require('../../../util/modules');
const model = require('../../../model/admin/user/editUserModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      uid: {
        type: 'string'
      },
      name: {
        type: 'string'
      },
      display_name: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      phone: {
        type: 'string'
      }
    },
    required: ['uid', 'name', 'display_name', 'email', 'phone']
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
 * @api {POST} /admin/user/editUser/ unblockUser
 * @apiName unblockUser
 * @apiGroup Admin
 * @apiDescription 禁言及解除禁言使用者
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} uid 使用者UID
 * @apiParam {Boolean} [name] 姓名
 * @apiParam {String} [display_name] 顯示名稱
 * @apiParam {String} [email] 電子郵件
 * @apiParam {String} [phone] 鳳
 * @apiParamExample {JSON} Request-Example
 * {
 *   "uid": "oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *   "display_name": "摁摁"
 * }
 */
