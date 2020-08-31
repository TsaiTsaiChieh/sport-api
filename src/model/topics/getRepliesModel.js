const db = require('../../util/dbUtil');
const func = require('./topicFunctions');
const countPerPage = 20;
function dbFind(aid, page) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__reply.findAndCountAll({
        where: {
          status: 1,
          article_id: aid
        },
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * page, // 跳過幾個 = limit * index
        distinct: true,
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get replies failed');
    }
  });
}
async function getReplies(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const aid = args.aid;
      const page = args.page;

      const replies = await dbFind(aid, page);

      const uid = (args.token !== null) ? args.token.uid : null;

      const usersToGet = [];
      let usersInfo = [];
      const infosToGet = []; // reply_id array
      let likesCount = [];
      let myLikes = [];
      const replytoToGet = [];
      let replytoInfo = [];
      for (let i = 0; i < replies.rows.length; i++) {
        if (replies.rows[i].replyto_id) {
          replytoToGet.push(replies.rows[i].replyto_id);
        }
        infosToGet.push(replies.rows[i].reply_id);
        usersToGet.push(replies.rows[i].uid);
        replies.rows[i].images = JSON.parse(replies.rows[i].images);
      }
      // console.log(replytoToGet)
      /* 讀取按讚數 */
      try {
        likesCount = await func.getReplyLikeCount(infosToGet); // 拿到的東西格式 [ { reply_id: '1', count: 2 }, { reply_id: '2', count: 1 } ]
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get like count failed' });
      }

      /* 讀取我按過的讚 */
      if (uid) {
        try {
          myLikes = await func.getIsUserLikeReply(uid, infosToGet); // 拿到的東西格式 [ { reply_id: '1', count: 2 }, { reply_id: '2', count: 1 } ]
        } catch (error) {
          console.error(error);
          reject({ code: 500, error: 'get my likes failed' });
        }
      }

      /* 讀取user info */
      const usersToGetUnique = [...new Set(usersToGet)];
      try {
        usersInfo = await func.getUserInfo(usersToGetUnique);
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get user info failed' });
      }

      /* 讀取要取得的被回覆內容 */
      try {
        replytoInfo = await func.getReplyContent(replytoToGet);
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get reply info failed' });
      }
      // console.log(replytoInfo)
      for (let i = 0; i < replies.rows.length; i++) { // 把拿到的userinfo塞回去
        let likeCount = likesCount.filter(obj => obj.reply_id === replies.rows[i].reply_id); // 處理按讚數 把aid=id的那則挑出來
        likeCount = likeCount[0] ? likeCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        replies.rows[i].like_count = likeCount;
        let myLike = myLikes.filter(obj => obj.reply_id === replies.rows[i].reply_id); // 處理我是否按讚 把aid=id的那則挑出來
        myLike = !!myLike[0];
        replies.rows[i].is_liked = myLike;
        let userInfo = usersInfo.filter(obj => obj.uid === replies.rows[i].uid.toString()); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null;
        replies.rows[i].user_info = userInfo;
        let replyInfo = replytoInfo.filter(obj => obj.reply_id === replies.rows[i].replyto_id); // 處理userinfo 把uid=id的那則挑出來
        replyInfo = replyInfo[0] ? replyInfo[0] : null;
        replies.rows[i].replyto_info = replyInfo;
        if (replyInfo !== null && replyInfo !== '[]') {
          // console.log(typeof replyInfo.images)
          if (typeof replyInfo.images === 'string') {
            replies.rows[i].replyto_info.images = JSON.parse(replyInfo.images);
          }
        }
      }
      resolve({ code: 200, page: page + 1, count: replies.count, replies: replies.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getReplies;
