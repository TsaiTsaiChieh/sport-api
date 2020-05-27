/* eslint-disable promise/always-return */
const model = require('../../model/admin/getAdminProfileModel');
async function controller(req, res) {
  req.body.token = req.token;
  const args = {
    token: req.token,
    bearer: req.headers.authorization
  };
  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = controller;
