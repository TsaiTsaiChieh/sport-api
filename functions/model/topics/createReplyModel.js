/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const func = require('./topicFunctions');
const sanitizeHtml = require('sanitize-html');
function dbCreate(insertData) {
  return new Promise(async function (resolve, reject) {
    try {
      log.info('create new reply to db');
      // await db.sequelize.models.topic__reply.sync({ alter: true }); //有新增欄位時才用
      const result = await db.sequelize.models.topic__reply.create(insertData)
      log.succ('create reply success');
      resolve(result.get('id'))
    } catch (error) {
      console.log(error);
      reject('create reply failed');
      return;
    }
  })
}
async function createReply(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if(typeof args.token === 'undefined'){
        reject({ code: 403, error: 'token expired' });
        return;
      }
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);
      const topicInfo = await func.getTopicInfo(args.aid)

      log.info('verify firebase user')
      if (!userSnapshot.exists) {
        reject({ code: 403, error: 'user verify failed' });
        return;
      }

      if(topicInfo.length === 0){
        reject({ code: 404, error: 'topic not found' });
        return;
      }
      // log.data(topicInfo[0])

      const insertData = {
        article_id: args.aid,
        uid: args.token.uid,
        replyto_id: null, // args.reply_id,
        images: JSON.stringify(args.images),
        content: args.content,
      }

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, {
        allowedTags: [ 'br', 'a' ],
        allowedAttributes: {
          'a': [ 'href' ],
        },
        allowedSchemes: [ 'http', 'https' ],
      });
      
      const article = await dbCreate(insertData)
      resolve({ code: 200 });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = createReply;