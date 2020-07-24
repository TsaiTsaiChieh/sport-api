const modules = require('../../../util/modules');
const model = require('../../../model/admin/home/updateHomeBannerModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      id: {
        type: 'number'
      },
      title: {
        type: 'string'
      },
      content: {
        type: 'string'
      }
    },
    required: ['id', 'title', 'content']
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
 * @api {POST} /admin/home/updateHomeBanner/ updateHomeBanner
 * @apiName updateHomeBanner
 * @apiGroup Admin
 * @apiDescription 修改輪播圖內容
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} id 圖片ID
 * @apiParam {String} title 標題
 * @apiParam {String} content 內容
 */
