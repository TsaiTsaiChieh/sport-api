/* eslint-disable promise/always-return */
const model = require('../../../model/admin/home/getHomeBannerModel');
async function controller(req, res) {
  model()
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = controller;
/**
 * @api {GET} /admin/home/getHomeBanner/ getHomeBanner
 * @apiName getHomeBanner
 * @apiGroup Admin
 * @apiDescription 取得首頁輪播圖
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *    "code":200,
 *    "using":[
 *       {
 *          "id":14,
 *          "name":"1591068034254.jpg",
 *          "sort":0,
 *          "imgurl":"https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1591068034254.jpg?alt=media&token=4a00e2b3-8981-449a-9aa8-91b821564b0e",
 *          "status":1,
 *          "title":"搞運彩 開幕慶活動 首儲1000送100",
 *          "content":"好康報給你！<br>\n看比賽參加神預測活動，準度決定你的領獎爽度🏆<br>\nMSI 明天即將開打，快來神預測拿超多好康和獎品啦~<br>\n提醒大家觀看賽事直播也會有贈送序號的活動哦！<br>\n精彩比賽絕對不要錯過！<br>",
 *          "createdAt":"2020-06-02T03:20:36.000Z",
 *          "updatedAt":"2020-06-02T03:25:45.000Z"
 *       }
 *    ]
 * }
 */
