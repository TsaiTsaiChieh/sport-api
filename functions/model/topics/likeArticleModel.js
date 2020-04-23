/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const sanitizeHtml = require('sanitize-html');
function dbFind(article_id) { // 確認文章存在
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          article_id: article_id
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      log.data(error);
      reject('like topics failed');
    }
  });
}
function checkLiked(uid, article_id) {
  return new Promise(async function(resolve, reject) {
    // await db.sequelize.models.topic__like.sync({ alter: true }); //有新增欄位時才用
    const result = await db.sequelize.models.topic__like.count({
      where: {
        uid: uid,
        article_id: article_id
      },
      raw: true
    });
    if (result !== 0) {
      reject('this article has been liked');
    } else {
      resolve();
    }
  });
}
function like(uid, article_id) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__like.create({ uid: uid, article_id: article_id });
      log.succ('like success');
      resolve();
    } catch (error) {
      log.data(error);
      reject('like article failed');
    }
  });
}
function unlike(uid, article_id) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__like.destroy({
        where: {
          uid: uid,
          article_id: article_id
        },
        raw: true
      });
      console.log(result);
      log.succ('unlike success');
      resolve();
    } catch (error) {
      log.data(error);
      reject('unlike article failed');
    }
  });
}
async function likeArticle(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);

      log.info('verify firebase user');
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      const uid = args.token.uid;
      try {
        const article = await dbFind(args.aid);
        if (!article[0]) {
          reject({ code: 404, error: 'article not found' });
          return;
        }
      } catch (err) {
        log.err(err);
        reject({ code: 500, error: err });
        return;
      }

      console.log(args.like);
      if (args.like === true) {
        await checkLiked(uid, args.article_id);
        await like(uid, args.article_id);
      } else {
        await unlike(uid, args.article_id);
      }
      resolve({ code: 200 });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = likeArticle;
