const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/home/setHomeBannerModel');
async function controller(req, res) {
  const schema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {
          type: 'number'
        },
        sort: {
          type: 'number'
        },
        name: {
          type: 'string'
        },
        imgurl: {
          type: ['string', 'null']
        },
        title: {
          type: 'string'
        },
        content: {
          type: 'string'
        }
      },
      required: ['id', 'sort', 'name']
    }
  };
  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    console.warn(ajv.errors);
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
 * @api {POST} /admin/home/setHomeBanner/ setHomeBanner
 * @apiName setHomeBanner
 * @apiGroup Admin
 * @apiDescription 修改輪播圖
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {String} id 圖片ID
 * @apiParam {String} sort 排序
 * @apiParam {String} name 圖片檔名
 * @apiParam {String} [imgurl] 圖片URL
 * @apiParam {String} [title] 標題
 * @apiParam {String} [content] 內容
 */
