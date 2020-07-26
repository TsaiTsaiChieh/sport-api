const ajv = require('../../../util/ajvUtil');
const model = require('../../../model/admin/payment/getTransListModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 0,
        maximum: 99999
      },
      uid: {
        type: 'string'
      },
      cash_status: {
        type: 'integer'
      }
    },
    required: ['page', 'cash_status']
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
 * @api {POST} /admin/payment/getTransList/ getTransList
 * @apiName getTransList
 * @apiGroup Admin
 * @apiDescription 取得待匯款玩家資訊
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} page 頁數
 * @apiParam {String} [uid]  搜尋UID
 * @apiParam {Integer} [cash_status] 搜尋狀態 [`-1`失敗, `0`待匯款, `1`完成]
 * @apiParamExample {JSON} Request-Example
 * {
 *   "page": 0,
 *   "cash_status": "0"
 * }
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *    "code":200,
 *    "count":2,
 *    "data":[
 *       {
 *          "transfer_id":79,
 *          "from_transfer_id":0,
 *          "uid":"2WMRgHyUwvTLyHpLoANk7gWADZn1",
 *          "status":1,
 *          "cash_status":0,
 *          "ingot":333,
 *          "ingot_real":50,
 *          "coin":222,
 *          "coin_real":111,
 *          "money":0,
 *          "money_real":0,
 *          "fee":0,
 *          "fee_real":0,
 *          "scheduled":"1591846459",
 *          "createdAt":"2020-06-11T03:34:21.825Z",
 *          "updatedAt":"2020-06-11T03:34:21.825Z",
 *          "user_info":{
 *             "uid":"2WMRgHyUwvTLyHpLoANk7gWADZn1",
 *             "status":2,
 *             "avatar":"https://lh3.googleusercontent.com/-NjLnpkYEcBg/AAAAAAAAAAI/AAAAAAAAAAA/AAKWJJODKpLq69IpsDQdQW6CnDzMliMOgA/photo.jpg",
 *             "name":"henry222",
 *             "display_name":"henry222",
 *             "signature":"kok"
 *          },
 *          "bank_info":{
 *             "uid":"2WMRgHyUwvTLyHpLoANk7gWADZn1",
 *             "bank_code":"001",
 *             "bank_username":"testajksdfn",
 *             "bank_account":"888"
 *          }
 *       }
 *    ]
 * }
 */
