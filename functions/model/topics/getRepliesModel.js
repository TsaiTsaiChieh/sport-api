/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');
const countPerPage = 20;
function dbFind (aid, page) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__reply.findAll({
        where: {
          article_id: aid
        },
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * page, // 跳過幾個 = limit * index
        distinct: true,
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get replies failed');
    }
  })
}
async function getReplies (args) {
  return new Promise(async function (resolve, reject) {
    try {
      const aid = args.aid;
      const page = args.page;

      const replies = await dbFind(aid, page)

      console.log(args.token)
      const uid = (args.token !== null) ? args.token.uid : null;

      let usersToGet = []
      let usersInfo = []
      let infosToGet = [] //reply_id array
      let likesCount = []
      let myLikes = []
      for (let i = 0; i < replies.length; i++) {
        infosToGet.push(replies[i].reply_id)
        usersToGet.push(replies[i].uid)
        replies[i].images = JSON.parse(replies[i].images)
      }
      /* 讀取按讚數 */
      try {
        likesCount = await func.getReplyLikeCount(infosToGet) // 拿到的東西格式 [ { reply_id: '1', count: 2 }, { reply_id: '2', count: 1 } ]
      } catch (error) {
        console.log(error)
        reject({ code: 500, error: 'get like count failed' })
      }
      
      /* 讀取我按過的讚 */
      if(uid){
        try {
          myLikes = await func.getIsUserLikeReply(uid, infosToGet) // 拿到的東西格式 [ { reply_id: '1', count: 2 }, { reply_id: '2', count: 1 } ]
        } catch (error) {
          console.log(error)
          reject({ code: 500, error: 'get my likes failed' })
        }
      }
      
      /* 下面讀取user info */
      const usersToGetUnique = [...new Set(usersToGet)];
      try {
        usersInfo = await func.getUserInfo(usersToGetUnique)
      } catch (error) {
        console.log(error)
        reject({ code: 500, error: 'get user info failed' })
      }

      for (let i = 0; i < replies.length; i++) { // 把拿到的userinfo塞回去
        let likeCount = likesCount.filter(obj => obj.reply_id === replies[i].reply_id.toString()); // 處理按讚數 把aid=id的那則挑出來
        likeCount = likeCount[0] ? likeCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        replies[i].like_count = likeCount;
        let myLike = myLikes.filter(obj => obj.reply_id === replies[i].reply_id.toString()); // 處理按讚數 把aid=id的那則挑出來
        myLike = myLike[0] ? true : false; // 解析格式 沒有資料的留言數為0
        replies[i].is_liked = myLike;
        let userInfo = usersInfo.filter(obj => obj.uid === replies[i].uid.toString()); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null; // 解析格式 沒有資料的留言數為0
        replies[i].user_info = userInfo;
      }
      resolve({ code: 200, replies: replies });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getReplies;
