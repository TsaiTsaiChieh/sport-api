const db = require('../../util/dbUtil');
const transfer = require('../../util/transfer');
const errs = require('../../util/errorCode');
function payModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      let trans = [];
      if (method === 'PUT') {
        const exchange = {
          type          : args.type,
          output        : args.output,
          ingot         : args.ingot         || 0,
          ingot_real    : args.ingot_real    || 0,
          coin          : args.coin          || 0,
          coin_real     : args.coin_real     || 0,
          dividend      : args.dividend      || 0,
          dividend_real : args.dividend_real || 0,
          money         : args.money         || 0,
          money_real    : args.money_real    || 0,
          fee           : args.fee           || 0,
          fee_real      : args.fee_real      || 0
        }
        const self = await db.sequelize.models.user.findOne({
          where: { uid: uid },
          attributes: ['ingot', 'coin', 'dividend'],
          raw: true
        });
        if (exchange.type === 'buy_coin') {
          try{
            trans = await db.sequelize.models.user.update({ coin: self.coin + exchange.coin, dividend: self.dividend + exchange.dividend }, { where: { uid: uid } });
            const trans_args = {
              to_uid: uid,
              type: 'buy_coin',
              dividend: exchange.dividend, // 0:紅利 1:搞幣 2:搞錠
              coin: exchange.coin
            };
            transfer.doTransfer(db, trans_args);
          } catch (error) {
            console.error(error);
            reject(errs.errsMsg('500', '20002'));
          }
        } else if (exchange.type === 'ingot2coin') {
          const pre_purse = await db.sequelize.models.user.findOne({
            where: {
              uid: uid
            },
            attributes: ['coin', 'dividend', 'ingot'],
            raw: true
          });
          if(exchange.output ==='coin'){
            /* 提領比例計算 */
            let ratio = 0;
            
            if ((pre_purse.ingot - exchange.ingot) < 0) {
              reject(errs.errsMsg('500','20003'));
            } else {
              trans = await db.sequelize.models.user.update({ ingot: self.ingot - exchange.ingot, coin: self.coin + (1-ratio)*exchange.ingot }, { where: { uid: uid } });
              const trans_args = {
                to_uid     : uid,
                type       : 'ingot2coin',
                ingot      : exchange.ingot, // 0:紅利 1:搞幣 2:搞錠
                ingot_real : exchange.ingot_real,
                coin       : exchange.coin,
                coin_real  : exchange.coin_real
              };
           
              transfer.doTransfer(db, trans_args);
            }
          }else if(exchange.output==="cash"){
            let ratio = 0;
            if (exchange.ingot <= 3000) {
              ratio = 0.015;
            } else if (exchange.ingot > 3000 && exchange.ingot < 10000) {
              ratio = 0.01;
            } else {
              ratio = 0.005;
            }
            
            if ((pre_purse.ingot - exchange.ingot) < 0) {
              reject(errs.errsMsg('500','20003'));
            } else {
              trans = await db.sequelize.models.user.update({ ingot: self.ingot - exchange.ingot, coin: self.coin + (1-ratio)*exchange.ingot }, { where: { uid: uid } });
              const trans_args = {
                uid: uid,
                type  : 'ingot2coin',
                ingot : exchange.ingot,
                money : exchange.money,
                money_real : exchange.money_real,
                fee   : exchange.fee,
                fee_real : exchange.fee_real
              };
              transfer.doMoney(db, trans_args);
            }
          }
        } else {
          console.log('您尚未選擇任何一項類別!');
        }
       
        /*取得經過計算後的錢包*/
        const purse = await db.sequelize.models.user.findOne({
          where: {
            uid: uid
          },
          attributes: ['coin', 'dividend', 'ingot'],
          raw: true
        });
        const payList = {
          status: trans[0],
          purse: purse
        };
        resolve(payList);
      }
    } catch (error) {
      console.log(error);
      reject(errs.errsMsg('500', '20001'));
    }
  });
}

module.exports = payModel;
