const db = require('../../util/dbUtil');
const sanitizeHtml = require('sanitize-html');
const { createTopicAllowed } = require('../../config/sanitizeHtmlConfig');
function dbFind(aid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          status: 1,
          article_id: aid
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get topic failed');
    }
  });
}
function dbEdit(aid, insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log('edit article');
      const record = await db.sequelize.models.topic__article.findOne({
        where: {
          article_id: aid
        }
      });
      record.update(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('edit article failed');
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

      // 撈原文
      let orig_article;
      try {
        const article = await dbFind(args.article_id);
        if (!article[0]) {
          reject({ code: 404, error: 'article not found' });
          return;
        }
        orig_article = article[0]; // 原文
        if (orig_article.status !== 1 && orig_article.status !== 3) {
          reject({ code: 404, error: 'topic not found' });
          return;
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      if (args.token.uid !== orig_article.uid) {
        reject({ code: 403, error: 'not your article' });
        return;
      }
      // console.log(orig_article);
      const insertData = {
        league: args.league,
        category: args.category,
        title: args.title,
        imgurl: args.imgurl
      };

      // 過濾html tags
      insertData.content = sanitizeHtml(args.content, createTopicAllowed);

      await dbEdit(args.article_id, insertData);
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createTopic;
