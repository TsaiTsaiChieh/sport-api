/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
function dbFind(aid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
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
      const record = await db.sequelize.models.topic__article.findOne({
        where: {
          article_id: aid
        }
      });
      record.update(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('delete article failed');
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
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      if (args.token.uid !== orig_article.uid) {
        reject({ code: 403, error: 'not your article' });
        return;
      }

      await dbEdit(args.article_id, { status: -1 });
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createTopic;
