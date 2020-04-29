/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
const func = require('../topics/topicFunctions');
// const Op = require('sequelize').Op;

let countPerPage = 3;
function dbFind(page) {
  return new Promise(async function(resolve, reject) {
    try {
      let resultFirst = [];
      if (page === null || page === 0) {
        resultFirst = await db.sequelize.models.topic__article.findAll({
          where: {
            // createdAt: { // 撈七天內的文
            //   [Op.lt]: new Date(),
            //   [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            // },
            status: 1,
            category: '賽事分析' // 撈一篇最高的賽事分析擺第一篇
          },
          limit: 1,
          order: [['view_count', 'DESC']], // 依瀏覽數排列
          distinct: true,
          raw: true
        });
      }
      const topics = resultFirst;

      if (page !== null) {
        countPerPage = 10;
      } else {
        page = 0;
      }

      const resultData = await db.sequelize.models.topic__article.findAndCountAll({
        where: {
          // createdAt: {
          //   [Op.lt]: new Date(),
          //   [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
          // }
          status: 1
        },
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * page,
        order: [['view_count', 'DESC']],
        distinct: true,
        raw: true
        // logging: console.log
      });

      resultData.rows.forEach(topic => {
        topics.push(topic);
      });
      const result = chkFirstTopic(topics);

      resolve({ topics: result, count: resultData.count });
    } catch (error) {
      console.error(error);
      reject('get topics failed');
    }
  });
}
function chkFirstTopic(topics) { // 把非第一篇賽事分析文剔除
  const shown_topic = [];
  const res = [];
  topics.forEach(topic => {
    if (!shown_topic.includes(topic.article_id)) {
      res.push(topic);
    }
    shown_topic.push(topic.article_id);
  });
  return res;
}
async function getTopics(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const topicsFind = await dbFind(args.page);
      const topics = topicsFind.topics;
      const count = topicsFind.count;

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
        console.error(error);
        reject({ code: 500, error: 'get reply count failed' });
      }
      /* 讀取留言數 */
      try {
        likesCount = await func.getTopicLikeCount(infosToGet); // 拿到的東西格式 [ { aid: '1', count: 2 }, { aid: '2', count: 1 } ]
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get like count failed' });
      }
      /* 下面讀取user info */
      const usersToGetUnique = [...new Set(usersToGet)];
      try {
        usersInfo = await func.getUserInfo(usersToGetUnique);
        // console.log(usersToGetUnique)
        // console.log(usersInfo)
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get user info failed' });
      }
      for (let i = 0; i < topics.length; i++) { // 把拿到的userinfo塞回去
        let replyCount = repliesCount.filter(obj => obj.article_id === topics[i].article_id.toString()); // 處理留言數 把aid=id的那則挑出來
        replyCount = replyCount[0] ? replyCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics[i].reply_count = replyCount;
        let likeCount = likesCount.filter(obj => obj.article_id === topics[i].article_id.toString()); // 處理按讚數 把aid=id的那則挑出來
        likeCount = likeCount[0] ? likeCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics[i].like_count = likeCount;
        let userInfo = usersInfo.filter(obj => obj.uid === topics[i].uid.toString()); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null;
        topics[i].user_info = userInfo;
      }
      /* 處理完了ヽ(●´∀`●)ﾉ */
      resolve({ code: 200, page: args.page + 1, count: count, topics: topics });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getTopics;
