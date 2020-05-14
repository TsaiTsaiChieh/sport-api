/* eslint-disable promise/always-return */
const db = require('../../util/dbUtil');
const transfer = require('../../util/transfer');
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
function getMoney(uid) {
  return new Promise(async function(resolve, reject) {
    const result = await db.sequelize.models.user.findOne({
      where: {
        uid: uid
      },
      attributes: ['coin', 'dividend'],
      raw: true
    });
    if (!result) {
      reject();
    } else {
      resolve(result);
    }
  });
}
function setMoney(uid, donate_uid, type, cost) {
  return new Promise(async function(resolve, reject) {
    const minus = await db.sequelize.models.user.findOne({
      where: { uid: uid },
      attributes: ['coin', 'dividend'],
      raw: true
    });
    if (minus) {
      if (type === 1) { // coin
        await db.sequelize.models.user.update({ coin: minus.coin - cost }, { where: { uid: uid } });
      } else if (type === 0) { // dividend
        await db.sequelize.models.user.update({ coin: minus.dividend - cost }, { where: { uid: uid } });
      }
    } else {
      reject();
    }
    const plus = await db.sequelize.models.user.findOne({
      where: { uid: donate_uid },
      attributes: ['coin', 'dividend'],
      raw: true
    });
    if (plus) {
      if (type === 1) { // coin
        await db.sequelize.models.user.update({ coin: (plus.coin + (cost / 2)) }, { where: { uid: donate_uid } });
      } else if (type === 0) { // dividend
        await db.sequelize.models.user.update({ coin: (plus.dividend + (cost / 2)) }, { where: { uid: donate_uid } });
      }
    } else {
      reject();
    }
    resolve();
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
        return;
      }

      let user_money;
      try {
        user_money = await getMoney(uid);
        console.log(user_money);
      } catch (e) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      let money_type;
      if (args.type === 'coin') {
        money_type = 1;
        if (user_money.coin < args.cost) {
          reject({ code: 403, error: 'coin not enough' });
          return;
        }
      } else if (args.type === 'dividend') {
        money_type = 0;
        if (user_money.dividend < args.cost) {
          reject({ code: 403, error: 'dividend not enough' });
          return;
        }
      } else {
        reject({ code: 400, error: 'money type error' });
        return;
      }

      // const src = await checkUser(uid); // 轉出者data
      // const dst = await checkUser(donate_uid); // 被捐贈者data

      const trans_args = {
        from_uid: uid,
        to_uid: donate_uid,
        type_id: args.article_id,
        type: 'article_donate',
        money_type: money_type, // 0:紅利 1:搞幣 2:搞錠
        money_value: args.cost
      };
      setMoney(uid, donate_uid, money_type, args.cost);
      transfer.doTransfer(db, trans_args);

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
