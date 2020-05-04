/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
function dbFind(god_uid) { // 確認大神存在
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.count({
        where: {
          uid: god_uid
        },
        raw: true
      });
      resolve(result !== 0);
    } catch (error) {
      console.error(error);
      reject('check god exists failed');
    }
  });
}
function checkLiked(uid, god_uid) {
  return new Promise(async function(resolve, reject) {
    // await db.sequelize.models.user__favoritegod.sync({ alter: true }); //有新增欄位時才用
    const result = await db.sequelize.models.user__favoritegod.count({
      where: {
        uid: uid,
        god_uid: god_uid
      },
      raw: true
    });
    if (result !== 0) {
      reject('this god has been liked');
    } else {
      resolve();
    }
  });
}
function like(uid, god_uid) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__favoritegod.create({ uid: uid, god_uid: god_uid });
      // console.log('like success');
      resolve();
    } catch (error) {
      // console.log(error);
      reject('like god failed');
    }
  });
}
function unlike(uid, god_uid) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__favoritegod.destroy({
        where: {
          uid: uid,
          god_uid: god_uid
        },
        raw: true
      });
      // console.log('unlike success');
      resolve();
    } catch (error) {
      // console.log(error);
      reject('unlike god failed');
    }
  });
}
async function favoriteGod(args) {
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
        const god_exists = await dbFind(args.god_uid);
        if (!god_exists) {
          reject({ code: 404, error: 'god not found' });
          return;
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      console.log(args.like);
      if (args.like === true) {
        await checkLiked(uid, args.god_uid);
        await like(uid, args.god_uid);
      } else if (args.like === false) {
        await unlike(uid, args.god_uid);
      } else {
        reject({ code: 400, error: 'missing like' });
        return;
      }
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = favoriteGod;
