/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const articleModel = require('../../model/topics/getArticleModel');
async function getTopics(req, res) {
  const aid = Number(req.params.aid);
  if (isNaN(aid) || !Number.isInteger(aid) || aid < 0 || aid > 9999999) {
    res.status(403).send('param error');
    return;
  }
  const args = { aid: aid, token: req.token };

  articleModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
/**
 * @api {GET} /topics/article/{{article_id}}
 * @apiName getTopics
 * @apiVersion 1.1.0
 * @apiDescription 取得討論區文章
 * @apiGroup Topics
 * @apiPermission no
 *
 * @apiParam (Request header)       Bearer token generate from firebase Admin SDK
 * @apiParam {String} article_id    文章ID
 */
