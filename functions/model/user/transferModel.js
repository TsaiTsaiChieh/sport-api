const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const modules = require('../../util/modules');


async function transferModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.begin);
      const end = modules.convertTimezone(args.end);
      /*儲值搞幣送紅利*/
      const deposit = await db.sequelize.query(
        `
          SELECT coin, dividend, "儲值搞幣" as title, "buy_coin" as en_title 
            FROM cashflow_deposits
           WHERE uid = :uid
        `,
        {
          replacements: { uid:uid }
        }
      );

      /*搞錠兌換搞幣*/
      const ingot2coin = await db.sequelize.query(
        `
          SELECT ingot, coin, "搞錠兌換搞幣" as title, "ingot2coin" as en_title  
            FROM cashflow_ingot_transfers
           WHERE uid = :uid
             AND status=0
        `,
        {
          replacements: { uid:uid }
        }
      );

      /*搞錠兌換現金*/
      const ingot2money = await db.sequelize.query(
        `
          SELECT ingot, coin, "搞錠兌換現金" as title, "ingot2money" as en_title  
            FROM cashflow_ingot_transfers
           WHERE uid = :uid
             AND status=1
        `,
        {
          replacements: { uid:uid }
        }
      );

      /*打賞*/
      /*玩家打賞此篇文章*/
      const donated = await db.sequelize.query(
        `
          SELECT cd.ingot, "玩家打賞此篇文章" as title, "donated" as en_title, ta.title as article_title  
            FROM cashflow_donates cd, topic__articles ta
           WHERE cd.article_id = ta.article_id
             AND cd.uid = :uid
             AND cd.status=0
        `,
        {
          replacements: { uid:uid }
        }
      );

      /*打賞此篇文章*/
      const donating = await db.sequelize.query(
        `
          SELECT cd.coin, cd.dividend, "打賞此篇文章" as title, "donating" as en_title, ta.title as article_title  
            FROM cashflow_donates cd, topic__articles ta
           WHERE cd.article_id = ta.article_id
             AND cd.from_uid = :uid
             AND cd.status=0
        `,
        {
          replacements: { uid:uid }
        }
      );
      
      console.log(donating);return;

      resolve({total:total})
    } catch (err) {
      console.log('Error in user/tranfer by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = transferModel;
