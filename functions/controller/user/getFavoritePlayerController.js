const model = require('../../model/user/getFavoritePlayerModel');
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
