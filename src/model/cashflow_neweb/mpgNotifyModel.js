const db = require('../../util/dbUtil');
const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const neweb_config = require('../../config/cashflow/neweb_config');
const modules = require('../../util/modules');
const mission_util = require('../../util/missionUtil');
const cashflow_util = require('../../util/cashflowUtil');
const invoice_model = require('../../model/invoice_ezpay/mpgModel');
async function mpgNotifyModel(res) {
  try {
    let issue_lottery;
    const update_order = await updateOrder(res); // 更新訂單狀態

    /* 判斷繳款是否成功，成功即開立發票 */
    if (update_order.rdata.Status === 'SUCCESS') {
      issue_lottery = await invoice_model(update_order.rdata.Result);
    } else {
      /* 開立失敗，回傳錯誤訊息 */
    }

    /* 任務/活動 區塊 */
    /* 判斷發票是否開立成功，成功即發放抽獎券 */
    if (issue_lottery.status) {
      const nowUnix = modules.moment().unix();
      const mission = await mission_util.activityDepositsCheckStatusReturnReward(update_order.uid, nowUnix);
      const param = {
        type: 2,
        activity_type: 'deposit',
        reward_type: 'lottery',
        reward_value: 1,
        uid: update_order.uid,
        type_id: mission.mission_deposit_id
      };
      await cashflow_util.cashflow_issue(param);
    } else {
      /* 開立失敗，回傳錯誤訊息 */
    }

    /* 判斷所有流程是否皆成功，成功回傳成功訊息 */
    // if (issue_status) {
    //   return "{'status':'success'}";
    // }
  } catch (e) {
    console.log('交易失敗');
  }
}

/* 繳款成功後，更新訂單狀態 */
async function updateOrder(res) {
  const exchange = res.body; // request data
  const setting = neweb_config.setting.test; // 讀取設定檔(測試/正式)

  /* 金流基本參數 */
  const HashKey = setting.hash_key; // hash key
  const HashIV = setting.hash_iv; // hash iv

  const return_data = await neweb_sdk.create_mpg_aes_decrypt(exchange.TradeInfo, HashKey, HashIV); // 解密繳款成功回傳資料
  const rdata = JSON.parse(return_data);
  const merchant_order_no = rdata.Result.MerchantOrderNo;
  if (exchange.Status === 'SUCCESS') {
    exchange.order_status = 1;// 訂單成功狀態改為1
  } else {
    exchange.order_status = 0;// 訂單失敗狀態改為0
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

  /* 1.更新錢包資料 2.判斷重新觸發不會重複給搞幣問題 */
  const purse_deposit = await db.CashflowDeposit.findOne({
    where: {
      serial_number: rdata.Result.MerchantOrderNo,
      order_status: 0
    },
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
    status: exchange.order_stutus,
    rdata: rdata,
    uid: purse_deposit.uid
  };

  return rtns;
}
module.exports = mpgNotifyModel;
