const newsModel = require('../../model/user/newsModel');
async function news(req, res) {
  try {
    res.json(await newsModel(req.method, req.body, req.token.uid));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
}

module.exports = news;
