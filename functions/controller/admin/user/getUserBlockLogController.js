const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/user/getUserBlockLogModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      uid: {
        type: 'string'
      }
    },
    required: ['uid']
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
 * @api {POST} /admin/user/getUserBlockLog/ getUserBlockLog
 * @apiName getUserBlockLog
 * @apiGroup Admin
 * @apiDescription 取得使用者違規記錄
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} uid 使用者UID
 * @apiParamExample {JSON} Request-Example
 * {
 *   "uid":"oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 * }
 */
