/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/user/getFavoriteGodModel');
async function favoriteGod(req, res) {
  req.body.token = req.token;
  req.body.god_uid = req.params.god_uid;
  const args = req.body;

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}

module.exports = favoriteGod;
