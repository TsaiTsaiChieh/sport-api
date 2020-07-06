const db = require('../../util/dbUtil');
const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const neweb_config = require('../../config/cashflow/neweb_config');
// const invoice_model = require('../../config/invoice_ezpay/mpg_model');
async function mpgNotifyModel(res) {
  const update = await updateOrder(res); //更新訂單狀態
  if(update.status){
    await invoice_model.mpgModel(update.rdata);
  }
}

async function updateOrder(res) {
  const exchange = res.body;                      //request data
  const setting = neweb_config.setting.test;           //讀取設定檔(測試/正式)

  /* 金流基本參數 */
  const HashKey = setting.hash_key;     //hash key
  const HashIV = setting.hash_iv;       //hash iv

  const return_data = await neweb_sdk.create_mpg_aes_decrypt(exchange.TradeInfo, HashKey, HashIV); //解密繳款成功回傳資料
  const rdata = JSON.parse(return_data);

  const merchant_order_no = rdata.Result.MerchantOrderNo;
  if (exchange.Status === 'SUCCESS') {
    exchange.order_status = 1;//訂單成功狀態改為1
  } else {
    exchange.order_status = 0;//訂單失敗狀態改為0
  }

  await db.CashflowDeposit.update({
    order_status: exchange.order_status,
    payment_type: rdata.Result.PaymentType,
    payment_store: rdata.Result.PayStore,
    trade_info: exchange.TradeInfo,
    trade_sha: exchange.TradeSha
  }, {
    where: {
      serial_number: merchant_order_no
    }
  });

  /* 更新錢包資料 */
  const purse_deposit = await db.CashflowDeposit.findOne({
    where: { serial_number: rdata.Result.MerchantOrderNo },
    attributes: ['uid', 'coin', 'dividend'],
    raw: true
  });
  // 檢查資料庫是否有資料
  const purse_self = await db.User.findOne({
    where: { uid: purse_deposit.uid },
    attributes: ['ingot', 'coin', 'dividend'],
    raw: true
  });
  if (typeof purse_deposit !== 'undefined' && typeof purse_self !== 'undefined') {
    await db.User.update({ coin: purse_self.coin + purse_deposit.coin, dividend: purse_self.dividend + purse_deposit.dividend }, { where: { uid: purse_deposit.uid } });
  }

  const rtns = {
    'status':exchange.order_stutus,
    'rdata':rdata
  }
  return rtns;
}
module.exports = mpgNotifyModel;
