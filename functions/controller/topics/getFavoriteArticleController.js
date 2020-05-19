/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const model = require('../../model/topics/getFavoriteArticleModel');
async function getTopics(req, res) {
  let page = 0;
  if (typeof req.params.page !== 'undefined' && req.params.page !== null) {
    page = req.params.page;
  }

  const args = { page: page, token: req.token };

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
