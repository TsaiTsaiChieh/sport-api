/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');
const countPerPage = 10;
function dbFind(where, page) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: where,
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * page, // 跳過幾個 = limit * index
        order: [['article_id', 'DESC']],
        distinct: true,
        raw: true
      });
      resolve(result);
    } catch (error) {
      log.data(error);
      reject('get topics failed');
    }
  });
}
async function getTopics(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // const replyCount = await func.getTopicReplyCount(args.aid)
      // console.log(replyCount)

      const where = {};
      let page = 0;

      if (typeof args.type !== 'undefined' && args.type !== null) {
        where.type = args.type;
      }
      if (typeof args.category !== 'undefined' && args.type !== null) {
        where.category = args.category;
      }
      if (typeof args.page !== 'undefined' && args.type !== null) {
        page = args.page;
      }

      const topics = await dbFind(where, page);

      /* 讀取一些別的資料 */
      const usersToGet = [];
      let usersInfo = [];
      const infosToGet = []; // 把aid存進來
      let repliesCount = [];
      let likesCount = [];
      for (let i = 0; i < topics.length; i++) {
        infosToGet.push(topics[i].article_id);
        usersToGet.push(topics[i].uid);
      }
      /* 讀取留言數 */
      try {
        repliesCount = await func.getTopicReplyCount(infosToGet); // 拿到的東西格式 [ { aid: '1', count: 2 }, { aid: '2', count: 1 } ]
      } catch (error) {
        console.log(error);
        reject({ code: 500, error: 'get reply count failed' });
      }
      /* 讀取按讚數 */
      try {
        likesCount = await func.getTopicLikeCount(infosToGet); // 拿到的東西格式 [ { aid: '1', count: 2 }, { aid: '2', count: 1 } ]
      } catch (error) {
        console.log(error);
        reject({ code: 500, error: 'get like count failed' });
      }
      /* 下面讀取user info */
      const usersToGetUnique = [...new Set(usersToGet)];
      try {
        usersInfo = await func.getUserInfo(usersToGetUnique);
        log.data(usersToGetUnique);
        log.data(usersInfo);
      } catch (error) {
        console.log(error);
        reject({ code: 500, error: 'get user info failed' });
      }
      for (let i = 0; i < topics.length; i++) {
        // 把拿到的userinfo塞回去
        let replyCount = repliesCount.filter(
          (obj) => obj.article_id === topics[i].article_id.toString()
        ); // 處理留言數 把aid=id的那則挑出來
        replyCount = replyCount[0] ? replyCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics[i].reply_count = replyCount;
        let likeCount = likesCount.filter(
          (obj) => obj.article_id === topics[i].article_id.toString()
        ); // 處理按讚數 把aid=id的那則挑出來
        likeCount = likeCount[0] ? likeCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics[i].like_count = likeCount;
        let userInfo = usersInfo.filter(
          (obj) => obj.uid === topics[i].uid.toString()
        ); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null;
        topics[i].user_info = userInfo;
      }
      /* 處理完了ヽ(●´∀`●)ﾉ */
      resolve({ code: 200, topics: topics });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = getTopics;
