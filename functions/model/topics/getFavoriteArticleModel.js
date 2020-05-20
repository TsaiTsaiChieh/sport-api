const db = require('../../util/dbUtil');
const func = require('./topicFunctions');
const Op = require('sequelize').Op;
const countPerPage = 20;

function dbFind(uid, page) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__favoritearticle.findAndCountAll({
        where: {
          uid: uid
        },
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * page, // 跳過幾個 = limit * index
        distinct: true,
        raw: true
      });
      // console.log(result)
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get topics failed');
    }
  });
}
async function getTopics(articles) { // 傳入array aid
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          article_id: {
            [Op.or]: articles
          }
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
async function getArticle(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const uid = args.token.uid;
      const page = parseInt(args.page);

      const usertopic = await dbFind(uid, page);
      const topicsToGet = [];
      for (let i = 0; i < usertopic.rows.length; i++) {
        topicsToGet.push(usertopic.rows[i].article_id);
      }

      const topics1 = await getTopics(topicsToGet);
      const topics = {
        rows: topics1
      };

      /* 讀取一些別的資料 */
      const usersToGet = [];
      let usersInfo = [];
      const infosToGet = []; // 把aid存進來
      let repliesCount = [];
      let likesCount = [];
      for (let i = 0; i < topics.rows.length; i++) {
        infosToGet.push(topics.rows[i].article_id);
        usersToGet.push(topics.rows[i].uid);
      }
      /* 讀取留言數 */
      try {
        repliesCount = await func.getTopicReplyCount(infosToGet); // 拿到的東西格式 [ { aid: '1', count: 2 }, { aid: '2', count: 1 } ]
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get reply count failed' });
      }
      /* 讀取按讚數 */
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
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get user info failed' });
      }
      for (let i = 0; i < topics.rows.length; i++) { // 把拿到的userinfo塞回去
        let replyCount = repliesCount.filter(obj => obj.article_id === topics.rows[i].article_id); // 處理留言數 把aid=id的那則挑出來
        replyCount = replyCount[0] ? replyCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics.rows[i].reply_count = replyCount;
        let likeCount = likesCount.filter(obj => obj.article_id === topics.rows[i].article_id); // 處理按讚數 把aid=id的那則挑出來
        likeCount = likeCount[0] ? likeCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics.rows[i].like_count = likeCount;
        let userInfo = usersInfo.filter(obj => obj.uid === topics.rows[i].uid.toString()); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null;
        topics.rows[i].user_info = userInfo;
        if (topics.rows[i].status !== 1) {
          topics.rows[i].league = '已刪除';
          topics.rows[i].category = '已刪除';
          // topics.rows[i].title = '(本文已被刪除)';
          topics.rows[i].content = null;
        }
      }
      /* 處理完了ヽ(●´∀`●)ﾉ */
      resolve({ code: 200, page: page + 1, count: usertopic.count, topics: topics.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getArticle;
