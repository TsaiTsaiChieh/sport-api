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
 * @api {GET} /topics/replies/:article_id/:page
 * @apiName getReplies
 * @apiDescription 取得文章底下留言
 * @apiGroup Topics
 * @apiParam {String} article_id    文章ID
 * @apiParam {Number} page          頁數
 * @apiSuccess {JSON} response
 * {
 *   "code": 200,
 *   "page": 1,
 *   "count": 9,
 *   "replies": [
 *     {
 *       "reply_id": 1,
 *       "article_id": 116,
 *       "uid": "oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *       "replyto_id": null,
 *       "replyto_floor": null,
 *       "content": "aaaaa",
 *       "images": [
 *         "bbbbb"
 *       ],
 *       "status": 1,
 *       "createdAt": "2020-04-22T06:34:52.000Z",
 *       "updatedAt": "2020-04-22T06:34:52.000Z",
 *       "like_count": 0,
 *       "is_liked": false,
 *       "user_info": {
 *         "uid": "oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *         "status": 2,
 *         "avatar": "https://png.pngtree.com/element_our/20190530/ourlarge/pngtree-520-couple-avatar-boy-avatar-little-dinosaur-cartoon-cute-image_1263411.jpg",
 *         "display_name": "ㄖㄍ測試帳號",
 *         "signature": "null"
 *       },
 *       "replyto_info": null
 *     }
 *   ]
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
