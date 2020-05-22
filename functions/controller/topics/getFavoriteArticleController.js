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
/**
 * @api {GET} /topics/getFavoriteArticle/:page
 * @apiName getFavoriteArticle
 * @apiDescription 取得我收藏的文章
 * @apiGroup Topics
 * @apiParam {Number} page          頁數 (必填, 從0開始)
 * @apiSuccess {JSON} response
 * {
 *   "code": 200,
 *   "page": 1,
 *   "count": 1,
 *   "topics": [
 *     {
 *       "article_id": 124,
 *       "uid": "oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *       "league": "MLB",
 *       "category": 3,
 *       "title": "title",
 *       "content": "<div><strike>sdf</strike><br /></div><div><span><b>sdf</b></span></div><div><span><i>sdf</i></span></div><div><span><u>sdf</u></span></div><div><span><font size=\"6\">sdf</font></span></div><div style=\"text-align:center\"><span><font size=\"3\">sdf</font></span></div><div style=\"text-align:right\"><span><font size=\"3\">sdf</font></span></div><div style=\"text-align:left\"><ul><li><span><font size=\"3\">sdf</font></span></li></ul></div><div style=\"text-align:left\"><ol><li><span><font size=\"3\">sdf</font></span></li></ol><font size=\"3\" color=\"#de1818\">sdf</font></div>",
 *       "view_count": 15,
 *       "like_count": 0,
 *       "status": 1,
 *       "delete_reason": null,
 *       "createdAt": "2020-04-22T06:19:00.000Z",
 *       "updatedAt": "2020-05-05T03:55:55.000Z",
 *       "reply_count": 0,
 *       "user_info": {
 *         "uid": "oRMfGrKx7VVSlbW9UIawcvwZ6sr2",
 *         "status": 2,
 *         "avatar": "https://png.pngtree.com/element_our/20190530/ourlarge/pngtree-520-couple-avatar-boy-avatar-little-dinosaur-cartoon-cute-image_1263411.jpg",
 *         "display_name": "ㄖㄍ測試帳號",
 *         "signature": "null"
 *       }
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
