/* eslint-disable promise/always-return */
const model = require('../../../model/admin/user/getNewsModel');
async function controller(req, res) {
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
 * @api {GET} /admin/user/getNews/ getNews
 * @apiName getNews
 * @apiGroup Admin
 * @apiDescription 取得系統通知
 * @apiPermission service, admin
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} page 頁數
 */
