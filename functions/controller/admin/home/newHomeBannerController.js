const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/home/newHomeBannerModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      imgurl: {
        type: 'string'
      }
    },
    required: ['imgurl', 'name']
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
 * @api {POST} /admin/home/newHomeBanner/ newHomeBanner
 * @apiName newHomeBanner
 * @apiGroup Admin
 * @apiDescription 新增輪播圖
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} name 圖片檔名
 * @apiParam {String} imgurl 圖片URL
 * {
 *   "name": "1585036268813.jpg",
 *   "imgurl": "http:///"
 * }
 */
