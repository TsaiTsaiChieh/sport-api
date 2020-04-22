/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const func = require('../topics/topicFunctions');
const Op = require('sequelize').Op;

const countPerPage = 25;
function dbFind(page) {
  return new Promise(async function (resolve, reject) {
    try {
      let topics = [];
      if(page === 0){
        const resultFirst = await db.sequelize.models.topic__article.findAndCountAll({
          where: {
            createdAt: { //撈七天內的文
              [Op.lt]: new Date(),
              [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
            },
            category: '賽事分析' //撈一篇最高的賽事分析擺第一篇
          },
          limit: 1,
          order: [ ['view_count', 'DESC'] ], //依瀏覽數排列
          distinct: true,
          raw: true
        })
        topics = resultFirst.rows;
      }
      const resultData = await db.sequelize.models.topic__article.findAndCountAll({
        where: {
          createdAt: {
            [Op.lt]: new Date(),
            [Op.gt]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        limit: countPerPage,  //每頁幾個
        offset: countPerPage * page, //跳過幾個 = limit * index
        order: [ ['view_count', 'DESC'] ],
        distinct: true,
        raw: true
      })

      resultData.rows.forEach(topic =>{
        topics.push(topic)
      })
      const result = chkFirstTopic(topics);

      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get topics failed');
      return;
    }
  })
}
function chkFirstTopic(topics){ //把非第一篇賽事分析文剔除
  let shown_topic = [];
  let res = [];
  topics.forEach(topic =>{
    if(!shown_topic.includes(topic.id)){
      res.push(topic)
    }
    shown_topic.push(topic.id)
  })
  return res;
}
async function getTopics(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let page = parseInt(args.params.page)

      const topics = await dbFind(page)

      /* 讀取一些別的資料 */
      let usersToGet = []
      let usersInfo = []
      let infosToGet = [] // 把aid存進來
      let repliesCount = []
      let likesCount = []
      for (let i = 0; i < topics.length; i++) {
        infosToGet.push(topics[i].id)
        usersToGet.push(topics[i].uid)
      }
      /* 讀取留言數 */
      try{
        repliesCount = await func.getTopicReplyCount(infosToGet) // 拿到的東西格式 [ { aid: '1', count: 2 }, { aid: '2', count: 1 } ]
      }catch(error){
        console.log(error)
        reject({ code: 500, error: 'get reply count failed' })
      }
      /* 讀取留言數 */
      try{
        likesCount = await func.getTopicLikeCount(infosToGet) // 拿到的東西格式 [ { aid: '1', count: 2 }, { aid: '2', count: 1 } ]
      }catch(error){
        console.log(error)
        reject({ code: 500, error: 'get like count failed' })
      }
      /* 下面讀取user info */
      let usersToGetUnique = [...new Set(usersToGet)];
      try{
        usersInfo = await func.getUserInfo(usersToGetUnique)
        log.data(usersToGetUnique)
        log.data(usersInfo)
      }catch(error){
        console.log(error)
        reject({ code: 500, error: 'get user info failed' })
      }
      for(let i = 0; i < topics.length; i++){ // 把拿到的userinfo塞回去
        let replyCount = repliesCount.filter( obj => obj.aid === topics[i].id.toString() ); // 處理留言數 把aid=id的那則挑出來
        replyCount = replyCount[0] ? replyCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics[i].reply_count = replyCount;
        let likeCount = likesCount.filter( obj => obj.aid === topics[i].id.toString() ); // 處理按讚數 把aid=id的那則挑出來
        likeCount = likeCount[0] ? likeCount[0].count : 0; // 解析格式 沒有資料的留言數為0
        topics[i].like_count = likeCount;
        let userInfo = usersInfo.filter( obj => obj.uid === topics[i].uid.toString() ); // 處理userinfo 把uid=id的那則挑出來
        userInfo = userInfo[0] ? userInfo[0] : null;
        topics[i].user_info = userInfo;
      }
      /* 處理完了ヽ(●´∀`●)ﾉ */
      resolve({ code: 200, topics: topics });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getTopics;