const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
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
      console.error('1!!');
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
  // console.log(uid, donate_uid, type, cost);
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
        await db.sequelize.models.user.update({ dividend: minus.dividend - cost }, { where: { uid: uid } });
      }
    } else {
      reject();
    }
    const plus = await db.sequelize.models.user.findOne({
      where: { uid: donate_uid },
      attributes: ['ingot'],
      raw: true
    });
    if (plus) {
      await db.sequelize.models.user.update({ ingot: (plus.ingot + (cost / 2)) }, { where: { uid: donate_uid } });
    } else {
      reject();
    }
    resolve();
  });
}
function logData(article_id, uid, cost) {
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {
        article_id: article_id,
        uid: uid,
        cost: cost
      };
      // await db.sequelize.models.topic__donate.sync({ alter: true }); // 有新增欄位時才用
      await db.sequelize.models.topic__donate.create(insertData);
      resolve();
    } catch (error) {
      console.error(error);
      reject('cannot log data');
    }
  });
}
async function donate(args) {
  return new Promise(async function(resolve, reject) {
    const t = await db.sequelize.transaction();
    try {
      const uid = args.token.uid;
      let article;

      if (typeof args.token === 'undefined') {
        reject({ code: 403, error: 'token expired' });
        return;
      }

      /** * 打賞發放紅利記錄 ***/
      /* 最小可打賞金額判斷 */
      if (args.cost < 2) {
        reject({ code: 500, error: '低於最小可打賞金額' });
        return;
      }

      const scheduled = modules.moment().unix();
      let fb_dividend = 0;
      /* 最低回饋打賞金額:10(依據四捨五入原則回饋1紅利) */
      try {
        if (args.cost >= 10) {
          fb_dividend = args.cost * 0.05;
          db.sequelize.models.cashflow_dividend.create({
            uid: uid,
            expire_points: parseInt(fb_dividend),
            dividend_real: fb_dividend,
            status: 1,
            dividend_status: 1,
            scheduled: scheduled
          });
        }
      } catch (e) {
        reject({ code: 500, error: 'issue dividend error' });
      }

      /** * 打賞發放紅利錢包給紅利 ***/
      try {
        const purse_self = await db.User.findOne({
          where: { uid: uid },
          attributes: ['ingot', 'coin', 'dividend'],
          raw: true
        });
        if (typeof purse_deposit !== 'undefined' && typeof purse_self !== 'undefined') {
          await db.User.update({ dividend: purse_self.dividend + fb_dividend }, { where: { uid: uid } });
        }
      } catch (e) {
        reject({ code: 500, error: 'update purse error' });
      }

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
      if (article[0].status !== 1 && article[0].status !== 3) {
        reject({ code: 404, error: 'topic not found' });
        return;
      }
      if (article[0].category === 1) {
        reject({ code: 403, error: 'cannot donate 公告' });
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
        // console.log(user_money);
      } catch (e) {
        reject({ code: 404, error: 'user not found' });
        return;
      }

      let money_type;
      let coin = 0;
      let dividend = 0;
      const ingot = args.cost - Math.round(args.cost / 2);
      const ingot_real = args.cost - args.cost / 2;

      if (args.type === 'coin') {
        money_type = 1;
        coin = (-1) * args.cost;
        if (user_money.coin < args.cost) {
          reject({ code: 403, error: 'coin not enough' });
          return;
        }
      } else if (args.type === 'dividend') {
        money_type = 0;
        dividend = (-1) * args.cost;
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
        status: money_type,
        from_uid: uid,
        uid: donate_uid,
        article_id: args.article_id,
        dividend: dividend,
        coin: coin,
        ingot: ingot,
        ingot_real: ingot_real,
        scheduled: scheduled
      };

      // const t = await db.sequelize.transaction();

      setMoney(uid, donate_uid, money_type, args.cost);
      logData(args.article_id, uid, (args.cost / 2));
      await db.sequelize.models.cashflow_donate.create(trans_args);

      await t.commit();
      // console.log(article)
      // await checkLiked(uid, args.aid);

      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      await t.rollback();
      reject({ code: 500, error: err });
    }
  });
}
module.exports = donate;
