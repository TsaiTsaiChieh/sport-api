/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const repliesModel = require('../../model/topics/getRepliesModel');
async function getTopics(req, res) {
  const aid = Number(req.params.aid);
  const page = Number(req.params.page);
  if (isNaN(aid) || !Number.isInteger(aid) || aid < 0 || aid > 9999999) {
    res.status(403).send('param error');
    return;
  }
  if (isNaN(page) || !Number.isInteger(page) || page < 0 || page > 9999999) {
    res.status(403).send('param error');
    return;
  }
  repliesModel({ aid: aid, page: page, token: req.token })
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
/**
 * @api {GET} /topics/replies/{{article_id}}/{{page}}
 * @apiName getTopics
 * @apiVersion 1.1.0
 * @apiDescription 取得文章留言
 * @apiGroup Topics
 * @apiPermission no
 *
 * @apiParam {String} article_id    文章ID
 * @apiParam {String} page    頁數，從0開始為第一頁
 */
