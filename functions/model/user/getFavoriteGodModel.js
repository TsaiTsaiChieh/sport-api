/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
function dbFind(uid, god_uid) { // 確認大神存在
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user__favoritegod.findAll({
        where: {
          uid: uid,
          god_uid: god_uid
        },
        attributes: ['uid', 'god_uid', 'type'],
        raw: true
      });
      resolve(result);
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
      let type = [];
      try {
        type = await dbFind(uid, god_uid);
      } catch (err) {
        console.error(err);
        reject({ code: 500, error: err });
        return;
      }

      const result = [];
      type.forEach(item => {
        result.push(item.type);
      });

      resolve({ code: 200, result: result });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = favoriteGod;
