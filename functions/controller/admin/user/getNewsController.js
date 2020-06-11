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
