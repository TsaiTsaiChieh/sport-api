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
function checkLiked(uid, god_uid, type) {
  return new Promise(async function(resolve, reject) {
    // await db.sequelize.models.user__favoritegod.sync({ alter: true }); //有新增欄位時才用
    const result = await db.sequelize.models.user__favoritegod.count({
      where: {
        uid: uid,
        god_uid: god_uid,
        type: type
      },
      raw: true
    });
    if (result !== 0) {
      reject('already like');
    } else {
      resolve();
    }
  });
}
function like(uid, god_uid, type) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__favoritegod.create({
        uid: uid,
        god_uid: god_uid,
        type: type
      });
      resolve('like failed');
    } catch (error) {
      console.log(error);
      reject();
    }
  });
}
function unlike(uid, god_uid, type) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__favoritegod.destroy({
        where: {
          uid: uid,
          god_uid: god_uid,
          type: type
        },
        raw: true
      });
      resolve('unlike failed');
    } catch (error) {
      console.log(error);
      reject();
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

      const uid = args.token.uid;
      const god_uid = args.god_uid;
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

      const add = args.add;
      const remove = args.remove;

      if (typeof add !== 'undefined' && add !== null) {
        add.forEach(async function(item) {
          try {
            await checkLiked(uid, god_uid, item);
            like(uid, god_uid, item);
          } catch (e) {
            console.log(e);
          }
        });
      }

      if (typeof remove !== 'undefined' && remove !== null) {
        remove.forEach(async function(item) {
          try {
            unlike(uid, god_uid, item);
          } catch (e) {
            console.log(e);
          }
        });
      }
      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = favoriteGod;
