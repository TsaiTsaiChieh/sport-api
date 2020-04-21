/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');
const countPerPage = 20;
function dbFind(aid, page) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__reply.findAndCountAll({
        where: {
          article_id: aid
        },
        limit: countPerPage,  //每頁幾個
        offset: countPerPage * page, //跳過幾個 = limit * index
        distinct: true,
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get replies failed');
      return;
    }
  })
}
async function getReplies(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let aid = args.aid;
      let page = args.page;

      const replies = await dbFind(aid, page)

      let usersToGet = []
      let usersInfo = []
      for (let i = 0; i < replies.rows.length; i++) {
        usersToGet.push(replies.rows[i].uid)
      }
      /* 下面讀取user info */
      let usersToGetUnique = [...new Set(usersToGet)];
      try{
        usersInfo = await func.getUserInfo(usersToGetUnique)
        // log.data(usersToGetUnique)
        // log.data(usersInfo)
      }catch(error){
        console.log(error)
        reject({ code: 500, error: 'get user info failed' })
      }
      for(let i = 0; i < replies.rows.length; i++){ // 把拿到的userinfo塞回去
        let userInfo = usersInfo.filter( obj => obj.uid === replies.rows[i].uid.toString() ); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null; // 解析格式 沒有資料的留言數為0
        replies.rows[i].user_info = userInfo;
      }
      resolve({ code: 200, replies: replies });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getReplies;