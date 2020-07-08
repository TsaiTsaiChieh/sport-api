/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const repliesModel = require('../../model/topics/getReplyModel');
async function getReply(req, res) {
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
module.exports = getReply;
/**
 * @api {GET} /topics/reply/:article_id getReply
 * @apiName getReply
 * @apiDescription 取得單一則留言
 * @apiGroup Topics
 * @apiParam {String} reply_id      留言ID
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200,
 *   "reply": {
 *     "reply_id": 223,
 *     "article_id": 190,
 *     "uid": "ag3wOqvuHUQ3GDqT2LeZG7rhlRa2",
 *     "replyto_id": 221,
 *     "replyto_floor": 0,
 *     "content": "喔",
 *     "images": [],
 *     "status": 1,
 *     "createdAt": "2020-05-18T03:17:24.000Z",
 *     "updatedAt": "2020-05-18T03:17:24.000Z",
 *     "like_count": 2,
 *     "is_liked": false,
 *     "user_info": {
 *       "uid": "ag3wOqvuHUQ3GDqT2LeZG7rhlRa2",
 *       "status": 2,
 *       "avatar": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/avatar%2Fag3wOqvuHUQ3GDqT2LeZG7rhlRa2%2FIMG_6671.JPG?alt=media&token=d44f4d9e-e0b4-4523-9b8f-5d6ec5a28687",
 *       "display_name": "七塔",
 *       "signature": "cheeeeeetah!"
 *     },
 *     "replyto_info": {
 *       "reply_id": 221,
 *       "article_id": 190,
 *       "uid": "ag3wOqvuHUQ3GDqT2LeZG7rhlRa2",
 *       "replyto_id": null,
 *       "replyto_floor": null,
 *       "content": "test",
 *       "images": [
 *         {
 *           "fileUrl": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/topic%2Fcomment%2Fag3wOqvuHUQ3GDqT2LeZG7rhlRa2%2F1589770995851930.jpeg?alt=media&token=44575a41-fa27-4c66-8e15-abf204884571",
 *           "thumbUrl": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/topic%2Fcomment%2Fag3wOqvuHUQ3GDqT2LeZG7rhlRa2%2F1589770995851930_thumb.jpg?alt=media&token=0a33972b-1392-4211-b655-8b074631f3b6"
 *         }
 *       ],
 *       "status": 1,
 *       "createdAt": "2020-05-18T03:03:21.000Z",
 *       "updatedAt": "2020-05-18T03:03:21.000Z"
 *     }
 *   }
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
