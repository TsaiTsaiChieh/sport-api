/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
function dbFind(article_id) { // 確認文章存在
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__article.findAll({
        where: {
          article_id: article_id,
          status: 1
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('get article error');
    }
  });
}
function checkUser(uid) {
  return new Promise(async function(resolve, reject) {
    // await db.sequelize.models.topic__replylike.sync({ alter: true }); //有新增欄位時才用
    const result = await db.sequelize.models.user.findOne({
      where: {
        uid: uid
      },
      raw: true
    });
    if (!result) {
      reject('user not found');
    } else {
      resolve(result);
    }
  });
}
async function donate(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }

      const uid = args.token.uid;
      let article;
      try {
        article = await dbFind(args.article_id); // 確認文章
        if (!article[0]) {
          reject({ code: 404, error: 'article not found' });
          return;
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      const donate_uid = article[0].uid;
      if (uid === donate_uid) {
        reject({ code: 400, error: 'cannot donate self' });
      }

      const src = await checkUser(uid); // 轉出者data
      const dst = await checkUser(donate_uid); // 被捐贈者data

      // console.log(article)
      // await checkLiked(uid, args.aid);

      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = donate;
