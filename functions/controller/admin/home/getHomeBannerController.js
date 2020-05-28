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
