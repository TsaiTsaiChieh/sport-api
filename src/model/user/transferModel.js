const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const modules = require('../../util/modules');

async function transferModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.begin);
      const end = modules.convertTimezone(args.end, {
        op: 'add',
        value: 1,
        unit: 'days'
      });

      const total = db.sequelize.query(
        `
        SELECT * FROM(
         SELECT 0 as ingot, coin, dividend, CONCAT("儲值搞幣", coin, "(尚未繳款)") as title, "buy_coin" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled 
           FROM cashflow_deposits
          WHERE uid = :uid
            AND order_status=0
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, coin, dividend, CONCAT("儲值搞幣", coin, "(已繳款)") as title, "buy_coin" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled 
           FROM cashflow_deposits
          WHERE uid = :uid
            AND order_status=1
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT ingot, coin, 0 AS dividend, "搞錠兌換搞幣" as title, "ingot2coin" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled 
           FROM cashflow_ingot_transfers
          WHERE uid = :uid
            AND scheduled BETWEEN :begin AND :end
            AND status=0  
          UNION 
         SELECT ingot, 0 AS coin, 0 AS dividend, "搞錠兌換現金" as title, "ingot2money" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled 
           FROM cashflow_ingot_transfers
          WHERE uid = :uid
            AND status=1    
            AND scheduled BETWEEN :begin AND :end   
          UNION
         SELECT 0 AS ingot, 0 AS coin, 0 AS dividend, "搞錠兌換現金(入帳)" as title, "ingot2money_income" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled 
           FROM cashflow_ingot_transfers
          WHERE uid = :uid
            AND status=1    
            AND scheduled BETWEEN :begin AND :end 
          UNION 
         SELECT (-1) * ingot, 0 AS coin, 0 AS dividend, "搞錠兌換現金(匯款失敗)" as title, "ingot2money_failed" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled 
           FROM cashflow_ingot_transfers
          WHERE uid = :uid
            AND status=1    
            AND scheduled BETWEEN :begin AND :end 
          UNION
         SELECT cd.ingot, 0 AS coin, 0 AS dividend, "玩家打賞此篇文章" as title, "donating" as en_title, NULL as name, NULL as name_ch, NULL as display_name, ta.title as article_title, scheduled 
           FROM cashflow_donates cd, topic__articles ta
          WHERE cd.article_id = ta.article_id
            AND cd.uid = :uid     
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, cd.coin, cd.dividend, "此篇文章已被打賞" as title, "donated" as en_title, NULL as name, NULL as name_ch, NULL as display_name, ta.title as article_title, scheduled 
           FROM cashflow_donates cd, topic__articles ta
          WHERE cd.article_id = ta.article_id
            AND cd.from_uid = :uid
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, cb.coin, cb.dividend, "購牌消費" as title, "buy" as en_title, ml.name, ml.name_ch, display_name, NULL as article_title, scheduled
           FROM cashflow_buys cb, match__leagues ml, users u
          WHERE cb.league_id = ml.league_id
            AND cb.uid = u.uid
            AND cb.uid = :uid
            AND cb.status = 1
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, 0 as coin, 0 as dividend, "賽事無效退費(處理中)" as title, "dividend_expire" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled
           FROM cashflow_buys
          WHERE status=-1
            AND uid = :uid
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, 0 as coin, 0 as dividend, "賽事注數小於0退費(處理中)" as title, "dividend_expire" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled
           FROM cashflow_buys
          WHERE status=0
            AND uid = :uid
            AND scheduled BETWEEN :begin AND :end
          UNION 
         SELECT 0 as ingot, cb.coin, cb.dividend, "購牌退費" as title, "buy" as en_title, ml.name, ml.name_ch, display_name, NULL as article_title, scheduled
           FROM cashflow_buys cb, match__leagues ml, users u
          WHERE cb.league_id = ml.league_id
            AND cb.uid = u.uid
            AND cb.status = -2
            AND cb.uid = :uid
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT cs.ingot, 0 as coin, 0 as dividend, "售牌收入" as title, "sell" as en_title, NULL as name, name_ch, display_name, NULL as article_title, cs.scheduled
           FROM cashflow_sells cs, cashflow_buys cb, users u, match__leagues ml
          WHERE cs.buy_id = cb.buy_id
            AND ml.league_id = cb.league_id
            AND cs.uid = u.uid
            AND cs.uid = :uid
            AND cs.scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, 0 as coin, expire_points as dividend, "消費紅利回饋" as title, "dividend_refund" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled
           FROM cashflow_dividends
          WHERE status=1
            AND uid = :uid
            AND scheduled BETWEEN :begin AND :end
          UNION
         SELECT 0 as ingot, 0 as coin, expire_points as dividend, "紅利過期紀錄" as title, "dividend_expire" as en_title, NULL as name, NULL as name_ch, NULL as display_name, NULL as article_title, scheduled
           FROM cashflow_dividends
          WHERE status=0
            AND uid = :uid
            AND scheduled BETWEEN :begin AND :end
         ) transfer
        ORDER BY scheduled DESC
         
        `
        ,
        {
          logging: true,
          replacements: { uid: uid, begin: begin, end: end },
          type: db.sequelize.QueryTypes.SELECT
        });

      resolve(total);
    } catch (err) {
      console.log('Error in user/tranfer by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = transferModel;
