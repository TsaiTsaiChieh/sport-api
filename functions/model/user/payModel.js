const db = require('../../util/dbUtil');
const errs = require('../../util/errorCode');
const modules = require('../../util/modules');
function payModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {

      uid = 'vl2qMYWJTnTLbmO4rtN8rxdodCo2';
      let trans = [];
      if (method === 'PUT') {
        const exchange = {
          type: args.type,
          output: args.output,
          ingot: args.ingot || 0,
          ingot_real: args.ingot_real || 0,
          coin: args.coin || 0,
          coin_real: args.coin_real || 0,
          dividend: args.dividend || 0,
          dividend_real: args.dividend_real || 0,
          money: args.money || 0,
          money_real: args.money_real || 0,
          fee: args.fee || 0,
          fee_real: args.fee_real || 0
        };
        const scheduled = modules.moment().unix();
        const self = await db.sequelize.models.user.findOne({
          where: { uid: uid },
          attributes: ['ingot', 'coin', 'dividend'],
          raw: true
        });
        if (exchange.type === 'buy_coin') {
          const t = await db.sequelize.transaction();

          try {
            await db.sequelize.models.user.update({ coin: self.coin + exchange.coin, dividend: self.dividend + exchange.dividend }, { where: { uid: uid } });
            const cashflow_deposit = await db.sequelize.models.cashflow_deposit.create({ uid: uid, money: exchange.money, money_real: exchange.money_real, coin: exchange.coin, coin_real: exchange.coin_real, dividend: exchange.dividend, dividend_real: exchange.dividend_real, scheduled: scheduled });
            if (!trans || !cashflow_deposit) {
              reject(errs.errsMsg('500', '20001'));
              return;
            }
            await t.commit();
          } catch (error) {
            console.error(error);
            await t.rollback();// 回滾
            reject(errs.errsMsg('500', '20002'));
            return;
          }
        } else if (exchange.type === 'ingot2coin') {
          /* 撈取使用者貨幣資料 */
          try {
            const pre_purse = await db.sequelize.models.user.findOne({
              where: {
                uid: uid
              },
              attributes: ['coin', 'dividend', 'ingot'],
              raw: true
            });
            if ((pre_purse.ingot - exchange.ingot) < 0) {
              reject(errs.errsMsg('500', '20003'));
              return;
            }
          } catch (err) {
            console.error(err);
            reject({ code: 500, error: err });
            return;
          }
          if (exchange.output === 'coin') {
            const ratio = 0;

            const t = await db.sequelize.transaction();

            try {
              trans = await db.sequelize.models.user.update({ ingot: self.ingot - exchange.ingot, coin: self.coin + (1 - ratio) * exchange.ingot }, { where: { uid: uid } });
              const status = 0;// 搞錠轉換搞幣
              const cashflow_ingot_transfer_coin = await db.sequelize.models.cashflow_ingot_transfer.create({ uid: uid, status: status, cash_status:0, ingot: (-1) * exchange.ingot, ingot_real: (-1) * exchange.ingot_real, coin: exchange.coin, coin_real: exchange.coin_real, money: exchange.money, money_real: exchange.money_real, fee: exchange.fee, fee_real: exchange.fee_real, scheduled: scheduled });
              if (!trans || !cashflow_ingot_transfer_coin) {
                reject(errs.errsMsg('500', '20001'));
                return;
              }
              await t.commit();
            } catch (err) {
              console.error(err);
              await t.rollback();
              reject({ code: 500, error: err });
              return;
            }
          } else if (exchange.output === 'cash') {
            /* 手續費-之後前後端都需調整為資料庫撈取 */
            let ratio = 0;
            if (exchange.ingot <= 3000) {
              ratio = 0.015;
            } else if (exchange.ingot > 3000 && exchange.ingot < 10000) {
              ratio = 0.01;
            } else {
              ratio = 0.005;
            }

            /* 後端計算轉換現金及手續費 */
            exchange.fee_real_backend = (-1) * ratio * exchange.ingot;
            exchange.fee_backend = Math.round(exchange.fee_real_backend);
            exchange.money_real_backend = exchange.ingot - exchange.fee_real_backend;
            exchange.money_backend = Math.round(exchange.money_real_backend);

            /* 判斷前後端計算是否一致 */
            if (exchange.fee_real_backend !== exchange.fee_real) {
              reject(errs.errsMsg('500', '20005')); return;
            }
            if (exchange.fee_backend !== exchange.fee) {
              reject(errs.errsMsg('500', '20005')); return;
            }
            if (exchange.money_real_backend !== exchange.money_real) {
              reject(errs.errsMsg('500', '20004')); return;
            }
            if (exchange.money_backend !== exchange.money) {
              reject(errs.errsMsg('500', '20004')); return;
            }

            const t = await db.sequelize.transaction();

            try {
              trans = await db.sequelize.models.user.update({ ingot: self.ingot - exchange.ingot }, { where: { uid: uid } });
              const status = 1;// 搞錠轉換現金
              const cashflow_ingot_transfer_cash = await db.sequelize.models.cashflow_ingot_transfer.create({ uid: uid, status: status, cash_status:0, ingot: (-1) * exchange.ingot, ingot_real: (-1) * exchange.ingot_real, coin: exchange.coin, coin_real: exchange.coin_real, money: exchange.money_backend, money_real: exchange.money_real_backend, dividend: exchange.dividend, dividend_real: exchange.dividend_real, fee: exchange.fee_backend, fee_real: exchange.fee_real_backend, scheduled: scheduled });
              if (!trans || !cashflow_ingot_transfer_cash) {
                reject(errs.errsMsg('500', '20001'));
                return;
              }
              await t.commit();
            } catch (err) {
              console.error(err);
              await t.rollback();
              reject({ code: 500, error: err });
              return;
            }
          }
        } else {
          console.log('您尚未選擇任何一項類別!');
        }

        /* 取得經過計算後的錢包 */
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
