const db = require('../../util/dbUtil');
const { moment } = require('../../util/modules');
const func = require('./topicFunctions');
const sanitizeHtml = require('sanitize-html');
const { createTopicAllowed } = require('../../config/sanitizeHtmlConfig');
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log('create new article to db');
      const result = await db.sequelize.models.topic__article.create(insertData);
      // console.log('create article success');
      resolve(result.get('article_id'));
    } catch (error) {
      console.error(error);
      reject('create article failed');
    }
  });
}

function dbNewsCreate(insertData, article) {
  return new Promise(async function(resolve, reject) {
    try {
      insertData.scheduled = moment().unix();
      insertData.sort = 1;// 發文
      insertData.sort_id = article;
      await db.sequelize.models.user__new.create(insertData);
      resolve({ news_status: 'success' });
    } catch (error) {
      console.error(error);
      reject('create news failed');
    }
  });
}
async function createTopic(args) {
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

      const insertData = {
        uid: args.token.uid,
        league: args.league,
        category: args.category,
        title: args.title
      };

      if (args.imgurl) insertData.imgurl = args.imgurl;

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, createTopicAllowed);

      const article = await dbCreate(insertData);
      const news = await dbNewsCreate(insertData, article);
      resolve({ code: 200, article_id: article, news_id: news });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createTopic;
