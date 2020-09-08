const db = require('../../util/dbUtil');
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
      console.error(error);
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
      await db.sequelize.models.topic__like.create({ uid: uid, article_id: article_id });
      // console.log('like success');
      resolve();
    } catch (error) {
      console.error(error);
      reject('like article failed');
    }
  });
}
function unlike(uid, article_id) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.topic__like.destroy({
        where: {
          uid: uid,
          article_id: article_id
        },
        raw: true
      });

      resolve();
    } catch (error) {
      console.error(error);
      reject('unlike article failed');
    }
  });
}
function countLikes(article_id, isPositive) {
  return new Promise(async function(resolve, reject) {
    const article = await db.Topic_Article.findOne({ where: { article_id } });

    if (article) {
      // 因應後台編輯按讚數，從計算 topic__like 總數，改為依據欄位 like_count +-1
      const like_count = isPositive ? article.like_count - 1 : article.like_count + 1;

      article.update({ like_count });
      resolve();
    } else {
      reject('count like failed');
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

      const uid = args.token.uid;
      try {
        const article = await dbFind(args.article_id);
        if (!article[0]) {
          reject({ code: 404, error: 'article not found' });
          return;
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      if (args.like === true) {
        await checkLiked(uid, args.article_id);
        await like(uid, args.article_id);
      } else {
        await unlike(uid, args.article_id);
      }
      await countLikes(args.article_id, args.like);

      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = likeArticle;
