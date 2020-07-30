/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
const getGodModel = require('./getFavoritePlayerModel');

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
function checkLiked(uid, god_uid, league) {
  return new Promise(async function(resolve, reject) {
    // await db.sequelize.models.user__favoriteplayer.sync({ alter: true }); // 有新增欄位時才用
    const result = await db.sequelize.models.user__favoriteplayer.count({
      where: {
        uid: uid,
        god_uid: god_uid,
        league: league
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
function like(uid, god_uid, league) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__favoriteplayer.create({
        uid: uid,
        god_uid: god_uid,
        league: league
      });
      resolve('like failed');
    } catch (error) {
      console.log(error);
      reject();
    }
  });
}
function unlike(uid, god_uid, league) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.models.user__favoriteplayer.destroy({
        where: {
          uid: uid,
          god_uid: god_uid,
          league: league
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
        for (let i = 0; i < add.length; i++) {
          try {
            await checkLiked(uid, god_uid, add[i]);
            await like(uid, god_uid, add[i]);
          } catch (e) {
            // console.log(e);
          }
        };
      }

      if (typeof remove !== 'undefined' && remove !== null) {
        for (let j = 0; j < remove.length; j++) {
          try {
            await unlike(uid, god_uid, remove[j]);
          } catch (e) {
            // console.log(e);
          }
        };
      }

      let fan_count; // 取得粉絲數(回傳uids)
      try {
        fan_count = await db.sequelize.models.user__favoriteplayer.findAll({
          attributes: [
            'uid',
            [db.sequelize.fn('COUNT', db.sequelize.col('god_uid')), 'follow_types']
          ],
          where: {
            god_uid: god_uid
          },
          group: 'uid',
          raw: true
        });
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: error });
      }

      // 把粉絲數寫回users
      await db.sequelize.models.user.update({
        fan_count: fan_count.length
      }, {
        where: {
          uid: god_uid
        },
        raw: true
      });

      // 取得最愛玩家並回傳
      getGodModel(args)
        .then(function(body) {
          resolve(body);
        })
        .catch(function(err) {
          resolve({ code: 200, error: err });
        });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = favoriteGod;