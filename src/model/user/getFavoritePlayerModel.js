/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
function dbFind(uid, god_uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user__favoriteplayer.findAll({
        where: {
          uid: uid,
          god_uid: god_uid
        },
        attributes: ['uid', 'god_uid', 'league'],
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject('check god failed');
    }
  });
}
function chkUserExist(uid) { // 確認使用者存在
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.count({
        where: {
          uid: uid
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
        if (!await chkUserExist(god_uid)) {
          reject({ code: 404, error: 'user is not exist' });
        }
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      let league = [];
      try {
        league = await dbFind(uid, god_uid);
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      const result = [];
      league.forEach(item => {
        result.push(item.league);
      });

      resolve({ code: 200, result: result });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = favoriteGod;
