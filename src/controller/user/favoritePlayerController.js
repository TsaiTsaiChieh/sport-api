const favoritePlayerModel = require('../../model/user/favoritePlayerModel');
async function favoritePlayer(req, res) {
  try {
    return res.status(200).json(await favoritePlayerModel(req));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
}

module.exports = favoritePlayer;
