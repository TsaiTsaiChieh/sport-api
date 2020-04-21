/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');

function dbFind(aid) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findOne({
        where: {
          'id': aid
        },
      })
      const view_count = result.view_count + 1;
      result.update({ view_count: view_count })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('get topics failed');
      return;
    }
  })
}
async function getArticle(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let article = await dbFind(args)
      if(!article){
        reject({ code: 404, error: 'article not found' });
      }

      let userInfo = []
      let likeCount = []
      let replyCount = []
      try{
        userInfo = await func.getUserInfo([article.uid])
        likeCount = await func.getTopicLikeCount([args])
        replyCount = await func.getTopicReplyCount([args])
        log.data(userInfo)
      }catch(error){
        console.log(error)
        reject({ code: 500, error: 'get user info failed' })
      }

      article = JSON.parse( JSON.stringify(article, null, 4) ) //把sequelize的object轉成一般的obj
      article.user_info = userInfo[0]
      article.like_count = likeCount[0].count
      article.reply_count = replyCount[0].count

      resolve({ code: 200, article: article });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = getArticle;