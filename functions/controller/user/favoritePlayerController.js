const modules = require('../../util/modules');
const favoritePlayerModel = require('../../model/user/favoritePlayerModel');
async function favoritePlayer(req, res) {
  const returnJson = {};
  try {
    res.json(await favoritePlayerModel(req.token.uid));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
  res.status(200).json(returnJson);
}

module.exports = favoritePlayer;
