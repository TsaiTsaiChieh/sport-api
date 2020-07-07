const db = require('../../util/dbUtil');
const func = require('./topicFunctions');
const sanitizeHtml = require('sanitize-html');
const { replyTopicAllowed } = require('../../config/sanitizeHtmlConfig');
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log('create new reply to db');
      // await db.sequelize.models.topic__reply.sync({ alter: true }); //有新增欄位時才用
      const result = await db.sequelize.models.topic__reply.create(insertData);
      // console.log('create reply success');
      resolve(result.get('id'));
    } catch (error) {
      console.error(error);
      reject('create reply failed');
    }
  });
}
async function createReply(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }
      if (!await func.chkUserBlocking(args.token.uid)) {
        reject({ code: 403, error: 'user is blocking' });
        return;
      }

      const topicInfo = await func.getTopicInfo(args.article_id);
      if (topicInfo === null) {
        reject({ code: 404, error: 'topic not found' });
        return;
      }
      if (topicInfo.status !== 1 && topicInfo.status !== 3) {
        reject({ code: 404, error: 'topic not found' });
        return;
      }
      // console.log(topicInfo[0])

      const insertData = {
        article_id: args.article_id,
        uid: args.token.uid,
        replyto_id: args.replyto_id, // args.reply_id,
        replyto_floor: args.replyto_floor,
        images: JSON.stringify(args.images),
        content: args.content
      };

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, replyTopicAllowed);

      await dbCreate(insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createReply;
