const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/user/getUsersModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 0,
        maximum: 99999
      },
      name: {
        type: 'string'
      },
      displayName: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      phone: {
        type: 'string'
      }
    },
    required: ['page']
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
 * @api {POST} /admin/user/getUsers/ getUsers
 * @apiName getUsers
 * @apiGroup Admin
 * @apiDescription 取得使用者列表
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} page 頁數
 * @apiParam {String} [name] 搜尋條件
 * @apiParam {String} [displayName] 搜尋條件
 * @apiParam {String} [email] 搜尋條件
 * @apiParam {String} [phone] 搜尋條件
 * @apiParamExample {JSON} Request-Example
 * {
 *   "page": 0
 * }
 */
