/* eslint-disable no-await-in-loop */
/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil_ifyu');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');
const countPerPage = 20;
function dbFind(where, page) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAndCountAll({
        where: where,
        limit: countPerPage,  //每頁幾個
        offset: countPerPage * page, //跳過幾個 = limit * index
        distinct: true,
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get topics failed');
      return;
    }
  })
}
async function getTopics(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // const replyCount = await func.getTopicReplyCount(args.aid)
      // console.log(replyCount)

      let where = {};
      let page = 0;

      if(typeof args.type !== 'undefined'){
        where['type'] = args.type
      }
      if(typeof args.category !== 'undefined'){
        where['category'] = args.category
      }
      if(typeof args.page !== 'undefined'){
        page = args.page
      }

      log.data(where)

      const topics = await dbFind(where, page)

      
      for (let i = 0; i < topics.rows.length; i++) {
        try{
          log.data(topics.rows[i])
          let replyCount = await func.getTopicReplyCount(topics.rows[i].id)
          console.log(replyCount)
          topics.rows[i].reply_count = replyCount;
        }catch(error){
          console.log(error)
          reject({ code: 500, error: 'get reply info failed' })
        }
      }

      resolve({ code: 200, topics: topics });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getTopics;