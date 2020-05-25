/* eslint-disable promise/always-return */
// const modules = require('../../util/modules');
const articleModel = require('../../model/topics/getArticleModel');
async function getArticle(req, res) {
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
module.exports = getArticle;
/**
 * @api {GET} /topics/article/:article_id getArticle
 * @apiName getArticle
 * @apiGroup Topics
 * @apiDescription 取得文章內容
 * @apiParam {Integer} article_id   文章ID
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200,
 *   "article": {
 *     "article_id": 189,
 *     "uid": "ag3wOqvuHUQ3GDqT2LeZG7rhlRa2",
 *     "league": "CPBL",
 *     "category": 3,
 *     "title": "炸裂炸裂炸裂",
 *     "content": "<div><a href=\"https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/topic%2Farticle%2Fag3wOqvuHUQ3GDqT2LeZG7rhlRa2%2F1589522021248011.jpeg?alt=media&amp;token=4bc27184-50dd-4352-a58c-99d03c996868\"><img src=\"https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/topic%2Farticle%2Fag3wOqvuHUQ3GDqT2LeZG7rhlRa2%2F1589522021248011_thumb.jpg?alt=media&amp;token=31e05340-1a48-4018-8797-0c189ac49528\" /></a></div>",
 *     "view_count": 68,
 *     "like_count": 1,
 *     "status": 1,
 *     "delete_reason": null,
 *     "createdAt": "2020-05-15T05:53:48.000Z",
 *     "updatedAt": "2020-05-20T03:22:41.000Z",
 *     "user_info": {
 *       "uid": "ag3wOqvuHUQ3GDqT2LeZG7rhlRa2",
 *       "status": 1,
 *       "avatar": "https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/avatar%2Fag3wOqvuHUQ3GDqT2LeZG7rhlRa2%2FIMG_6671.JPG?alt=media&token=d44f4d9e-e0b4-4523-9b8f-5d6ec5a28687",
 *       "display_name": "七塔",
 *       "signature": "cheeeeeetah!"
 *     },
 *     "reply_count": 0,
 *     "donate_count": 0,
 *     "is_liked": false,
 *     "is_donated": false,
 *     "is_favoGod": false,
 *     "is_favoArticle": false
 *   }
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
