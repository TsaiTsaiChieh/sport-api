/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const log = require('../../util/loggingUtil');
const sanitizeHtml = require('sanitize-html');
function dbFind(aid) { //確認文章存在
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          'article_id': aid
        },
        raw: true
      })
      resolve(result)
    } catch (error) {
      log.data(error);
      reject('like topics failed');
      return;
    }
  })
}
function checkLiked(uid, aid) {
  return new Promise(async function (resolve, reject) {
    // await db.sequelize.models.topic__like.sync({ alter: true }); //有新增欄位時才用
    const result = await db.sequelize.models.topic__like.count({
      where: {
        uid: uid,
        article_id: aid
      },
      raw: true
    })
    if(result !== 0){
      reject('this article has been liked')
    }else{
      resolve()
    }
  })
}
function like(uid, aid) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__like.create({ uid: uid, article_id: aid})
      log.succ('like success');
      resolve()
    } catch (error) {
      log.data(error);
      reject('like article failed');
      return;
    }
  })
}
function unlike(uid, aid) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__like.destroy({
        where: {
          uid: uid,
          article_id: aid
        },
        raw: true
      })
      console.log(result)
      log.succ('unlike success');
      resolve()
    } catch (error) {
      log.data(error);
      reject('unlike article failed');
      return;
    }
  })
}
async function likeArticle(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);

      log.info('verify firebase user')
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      const uid = args.token.uid;
      try {
        const article = await dbFind(args.aid)
        if(!article[0]){
          reject({ code: 404, error: 'article not found' });
          return;
        }
      } catch (err) {
        log.err(err);
        reject({ code: 500, error: err });
        return;
      }

      console.log(args.like)
      if(args.like === true){
        await checkLiked(uid, args.aid)
        await like(uid, args.aid)
      }else{
        await unlike(uid, args.aid)
      }
      resolve({ code: 200 });
    } catch (err) {
      log.err(err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = likeArticle;