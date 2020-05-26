/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/getTopicsModel');
const types = require('./types');
async function getTopics(req, res) {
  const league = types.getLeague();
  league.push(null);
  const category = types.getCategory();
  category.push(null);
  const schema = {
    type: 'object',
    properties: {
      uid: {
        type: ['string', 'null']
      },
      league: {
        type: ['string', 'null'],
        enum: league
      },
      category: {
        type: ['integer', 'null'],
        enum: category
      },
      count: {
        type: 'integer',
        maximum: 50,
        minimum: 0,
        default: 10
      },
      sortBy: {
        type: ['string', 'null'],
        enum: [null, 'like', 'view'],
        default: null
      },
      page: {
        type: 'integer',
        maximum: 99999,
        minimum: 0
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    console.log(modules.ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < modules.ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + modules.ajv.errors[i].dataPath + '\': ' + modules.ajv.errors[i].message);
    }
    res.status(400).json({ code: 400, error: 'schema not acceptable', message: ajv_errs });
    return;
  }
  req.body.token = req.token;
  const args = req.body;

  topicModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = getTopics;
/**
 * @api {POST} /topics/getTopics/ getTopics
 * @apiName getTopics
 * @apiDescription 取得討論區文章
 * @apiGroup Topics
 * @apiParam {String} [uid]         以uid搜尋 (給「我的文章」用, 沒用到就不要帶)
 * @apiParam {String} [league]      league_id (參考/topics/types/) (沒用到就不要帶)
 * @apiParam {Integer} [category]   category_id (參考/topics/types/) (沒用到就不要帶)
 * @apiParam {Integer} [sortBy]     排序方式 [`like`按讚數, `view`觀看數] (沒用到就不要帶, 預設以最新文章排序)
 * @apiParam {Integer} [count]      一頁幾筆資料 (沒特殊需求就不要帶, 0~50,預設`10`)
 * @apiParam {Number} page          頁數 (必填, 從`0`開始)
 * @apiParamExample {JSON} Request-Example
 * {
 *   "league": "CPBL",
 *   "category": 2,
 *   "page": 0
 * }
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200,
 *   "page": 1,
 *   "count": 88, //符合此搜尋條件的數量(供分頁用)
 *   "topics": [
 *     {
 *       "article_id": 140,
 *       "uid": "tODxQnJ64TUcCEA0oybSXNGzf5O2",
 *       "league": "MLB",
 *       "category": 3,
 *       "title": "桃猿VS統一(單場PM6:35)單場就是要喬很久~都2點了還沒喬好",
 *       "content": "<div><a href=\"https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/topic%2Farticle%2FtODxQnJ64TUcCEA0oybSXNGzf5O2%2F1587721088289288.jpeg?alt=media&amp;token=1624ed99-56ff-40a6-b3f1-fc4b5b7b8a3f\"><img src=\"https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/topic%2Farticle%2FtODxQnJ64TUcCEA0oybSXNGzf5O2%2F1587721088289288_thumb.jpg?alt=media&amp;token=c198ea6d-04bb-44e4-ac05-8d51d91f985d\" /></a></div><div><span>PM 01:00</span><br /><span>詳情</span><br /><span>味全龍二軍</span><br /><span>統一獅二軍(主)</span><br /><span>大 12.5 , 1.84</span><br /><br /><span>二軍看看就好還在摸索</span><br /><span>重點今晚6:35單場</span><br /><span>個人頁會有本場賽事推薦(目前還沒開盤)</span><br /><span>今天剩最後1次特價了</span><br /><span>有興趣合牌的朋友再來逛逛吧</span><br /><br /><span>統一這場運彩官網顯示有場中</span><br /><span>不過威剛跟天氣一樣多變</span><br /><span>改來改去說不定又沒了</span><br /><span>到時候再確認一下吧</span><br /><br /><span>還在喬.......</span><br /><span>耐心等候^ ^</span><br /></div>",
 *       "view_count": 10185,
 *       "like_count": 2,
 *       "status": 1,
 *       "delete_reason": null,
 *       "createdAt": "2020-04-24T09:38:38.000Z",
 *       "updatedAt": "2020-05-20T08:36:50.000Z",
 *       "reply_count": 21,
 *       "user_info": {
 *         "uid": "tODxQnJ64TUcCEA0oybSXNGzf5O2",
 *         "status": 1,
 *         "avatar": "https://firebasestorage.googleapis.com/v0/b/sport19y0715.appspot.com/o/default%2Favatar%2Fdefault-profile-avatar.jpg?alt=media&token=7753385f-5457-4fe2-af8e-acef75fcccd8",
 *         "display_name": "前端的一般玩家",
 *         "signature": "wwwwwwwwwwwwwwwww"
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
