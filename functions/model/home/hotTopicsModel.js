/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
const func = require('../topics/topicFunctions');
// const Op = require('sequelize').Op;

const countPerPage = 3;
function dbFind() {
  return new Promise(async function(resolve, reject) {
    try {
      let topics = [];
      const resultFirst = await db.sequelize.models.topic__article.findAll({
        where: {
          // createdAt: { // 撈七天內的文
          //   [Op.lt]: new Date(),
          //   [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
          // },
          category: '賽事分析' // 撈一篇最高的賽事分析擺第一篇
        },
        limit: 1,
        order: [['view_count', 'DESC']], // 依瀏覽數排列
        distinct: true,
        raw: true
      });
      topics = resultFirst;

      const resultData = await db.sequelize.models.topic__article.findAll({
        where: {
          // createdAt: {
          //   [Op.lt]: new Date(),
          //   [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
          // }
        },
        limit: countPerPage, // 每頁幾個
        order: [['view_count', 'DESC']],
        distinct: true,
        raw: true
        // logging: console.log
      });

      resultData.forEach(topic => {
        topics.push(topic);
      });
      const result = chkFirstTopic(topics);

      resolve(result);
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
      const topics = await dbFind();

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
      /* 讀取留言數 */
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
        // console.log(usersToGetUnique)
        // console.log(usersInfo)
      } catch (error) {
        console.log(error);
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
      resolve({ code: 200, topics: topics });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getTopics;
