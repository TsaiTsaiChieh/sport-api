const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const gash_config = require('../../config/cashflow/gash_config');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const request = require('request');
async function mpgModel(res) {
  const exchange = res.body; // request data
  const uid = res.token.uid;
  // const exchange = {'coin':1, 'dividend':1};
  //   const uid = '33333'; // 取得登入uid
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.PurchaseList.findOne({
        attributes: [
          'list_id',
          'coin',
          'dividend'
        ],
        where: {
          list_id: exchange.list_id,
          coin: exchange.coin,
          dividend: exchange.dividend
        },
        raw: true
      });
      if (!result) {
        reject({ msg: '沒有該項商品' });
      }

      const setting = gash_config.setting.official; // 讀取設定檔(測試/正式)
      exchange.merchant_order_no = neweb_sdk.get_order_no(); // 商品訂單編號
      /* 金流基本參數 */
      const cashflow_url = setting.cashflow_url; // 金流網址

      /* 金流-Gash資料 */
      createOrder(exchange, uid); // 建立訂單到資料庫

      /* 電信支付(需+15%手續費) */
      if (exchange.category === 'telecom') {
        exchange.coin = Math.floor(exchange.coin * 1.15);
      }

      const trade_arr = {
        serial_number: exchange.merchant_order_no,
        coin: exchange.coin,
        return_url: setting.return_url,
        paid: exchange.paid,
        category: exchange.category
      };
      request(
        {
          method: 'post',
          url: setting.vm_api_url,
          form: trade_arr
          // eslint-disable-next-line handle-callback-err
        }, function(error, response, return_data) {
          const checkout = neweb_sdk.CheckOutGash(cashflow_url, return_data); // 送出資訊到金流網址
          resolve(checkout);
        });
    } catch (err) {
      reject(err);
    }
  });
}
async function createOrder(exchange, uid) {
  /* 寫入交易資料，未付款(status=0) */
  const scheduled = modules.moment().unix();
  await db.sequelize.query(
    `
    INSERT INTO cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real, serial_number, scheduled) VALUES (:uid, :money, :money_real, :coin, :coin_real, :dividend, :dividend_real, :serial_number, :scheduled)
    `,
    {
      replacements: {
        uid: uid,
        money: exchange.coin,
        money_real: exchange.coin,
        coin: exchange.coin,
        coin_real: exchange.coin,
        dividend: exchange.dividend,
        dividend_real: exchange.dividend,
        serial_number: exchange.merchant_order_no,
        scheduled: scheduled
      },
      type: db.sequelize.QueryTypes.INSERT
    }
  );
}
module.exports = mpgModel;
