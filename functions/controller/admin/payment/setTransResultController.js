const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/payment/setTransResultModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      transfer_id: {
        type: 'number'
      },
      result: {
        type: 'number',
        enum: [-1, 0, 1]
      }
    },
    required: ['transfer_id', 'result']
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
 * @api {POST} /admin/payment/setTransResult/ setTransResult
 * @apiName setTransResult
 * @apiGroup Admin
 * @apiDescription 匯款結果
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} transfer_id transfer ID
 * @apiParam {Integer} result 結果[`-1`失敗,`0`待匯款,`1`已匯款]
 * {
 *   "transfer_id": 2,
 *   "result": -1
 * }
 */
