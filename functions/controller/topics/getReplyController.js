/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const repliesModel = require('../../model/topics/getReplyModel');
async function getTopics(req, res) {
  const rid = Number(req.params.rid);
  if (isNaN(rid) || !Number.isInteger(rid) || rid < 0 || rid > 9999999) {
    res.status(403).send('param error');
    return;
  }
  repliesModel({ rid: rid })
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
/**
 * @api {GET} /topics/reply/{{reply_id}}
 * @apiName getReply
 * @apiVersion 1.1.0
 * @apiDescription 取得單一則留言
 * @apiGroup Topics
 * @apiPermission no
 *
 * @apiParam {String} reply_id    留言ID
 */
