/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
function dbFind(reply_id) { // 確認文章存在
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__reply.findAll({
        where: {
          reply_id: reply_id
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('like reply failed');
    }
  });
}
function checkLiked(uid, reply_id) {
  return new Promise(async function(resolve, reject) {
    // await db.sequelize.models.topic__replylike.sync({ alter: true }); //有新增欄位時才用
    const result = await db.sequelize.models.topic__replylike.count({
      where: {
        uid: uid,
        reply_id: reply_id
      },
      raw: true
    });
    if (result !== 0) {
      reject('this reply has been liked');
    } else {
      resolve();
    }
  });
}
function like(uid, reply_id) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.topic__replylike.create({ uid: uid, reply_id: reply_id });
      // console.log('like success');
      resolve();
    } catch (error) {
      console.error(error);
      reject('like reply failed');
    }
  });
}
function unlike(uid, reply_id) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.topic__replylike.destroy({
        where: {
          uid: uid,
          reply_id: reply_id
        },
        raw: true
      });
      // console.log(result);
      // console.log('unlike success');
      resolve();
    } catch (error) {
      console.error(error);
      reject('unlike reply failed');
    }
  });
}
async function likeReply(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }
      const userSnapshot = await modules.getSnapshot('users', args.token.uid);

      // console.log('verify firebase user');
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      const uid = args.token.uid;
      try {
        const reply = await dbFind(args.reply_id);
        if (!reply[0]) {
          reject({ code: 404, error: 'reply not found' });
          return;
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      // console.log(args.like);
      if (args.like === true) {
        await checkLiked(uid, args.reply_id);
        await like(uid, args.reply_id);
      } else {
        await unlike(uid, args.reply_id);
      }
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = likeReply;
