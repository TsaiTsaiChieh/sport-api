const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/service/getReportsModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 0,
        maximum: 99999
      },
      status: {
        type: 'integer'
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
 * @api {POST} /admin/service/getReports/ getReports
 * @apiName getReports
 * @apiGroup Admin
 * @apiDescription 取得檢舉資訊
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} page 頁數
 * @apiParam {Integer} [status] 狀態 [`1`待處理,2`處理中,`3`擱置中,`9`已處理]
 * @apiParamExample {JSON} Request-Example
 * {
 *   "page": 0,
 *   "status": 1
 * }
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *    "code":200,
 *    "count":35,
 *    "data":[
 *       {
 *          "id":1,
 *          "uid":"oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *          "type":"article",
 *          "article_id":116,
 *          "content":"123",
 *          "status":1,
 *          "reply":"11",
 *          "createdAt":"2020-04-29T07:24:32.000Z",
 *          "updatedAt":"2020-06-04T03:55:53.000Z",
 *          "user_info":{
 *             "uid":"oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *             "status":9,
 *             "avatar":"https://png.pngtree.com/element_our/20190530/ourlarge/pngtree-520-couple-avatar-boy-avatar-little-dinosaur-cartoon-cute-image_1263411.jpg",
 *             "name":"如果",
 *             "display_name":"ㄖㄍ測試帳號",
 *             "signature":"null"
 *          },
 *          "article_info":{
 *             "article_id":116,
 *             "uid":"oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *             "league":"MLB",
 *             "category":3,
 *             "title":"title",
 *             "content":"baa<div><strike>sdf</strike><br /></div><div><span><b>sdf</b></span></div><div><span><i>sdf</i></span></div><div><span><u>sdf</u></span></div><div><span><font size=\"6\">sdf</font></span></div><div style=\"text-align:center\"><span><font size=\"3\">sdf</font></span></div><div style=\"text-align:right\"><span><font size=\"3\">sdf</font></span></div><div style=\"text-align:left\"><ul><li><span><font size=\"3\">sdf</font></span></li></ul></div><div style=\"text-align:left\"><ol><li><span><font size=\"3\">sdf</font></span></li></ol><font size=\"3\" color=\"#de1818\">sdf</font></div>",
 *             "view_count":128,
 *             "like_count":3,
 *             "status":1,
 *             "delete_reason":null,
 *             "createdAt":"2020-04-15T06:59:44.000Z",
 *             "updatedAt":"2020-06-01T09:36:13.000Z"
 *          }
 *       }
 *    ]
 * }
 */
