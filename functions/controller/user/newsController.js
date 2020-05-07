const modules = require('../../util/modules');
const newsModel = require('../../model/user/newsModel');
async function news(req, res) {
  const returnJson = {};
  try {
    res.json(await newsModel(req.method, req.body, req.token.uid));
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
  res.status(200).json(returnJson);
}

module.exports = news;
