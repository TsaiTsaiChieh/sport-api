const modules = require('../../../util/modules');
const model = require('../../../model/admin/manager/getLogsModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 0,
        maximum: 99999
      },
      api_name: {
        type: 'string'
      },
      name: {
        type: 'string'
      }
    },
    required: ['page']
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
 * @api {POST} /admin/home/delHomeBanner/ delHomeBanner
 * @apiName delHomeBanner
 * @apiGroup Admin
 * @apiDescription 主管讀取操作記錄
 * @apiPermission admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} page 圖片ID
 * @apiParam {String} [api_name] 哪一支API
 * @apiParam {String} [name] 客服顯示名稱
 */
