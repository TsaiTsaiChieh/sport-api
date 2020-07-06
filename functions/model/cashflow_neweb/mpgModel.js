const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const neweb_config = require('../../config/cashflow/neweb_config');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function mpgModel(res) {

  const exchange = res.body;  //request data
  const uid = res.token.uid;  //取得登入uid

  return new Promise(async function(resolve, reject) {
    try {
      // const result = await db.PurchaseList.findOne({
      //   attributes: [
      //     'list_id',
      //     'coin',
      //     'dividend'
      //   ],
      //   where: {
      //     'list_id': exchange.list_id,
      //     'coin': exchange.coin,
      //     'dividend': exchange.dividend
      //   },
      //   raw: true
      // });
      // if(!result){
      //   reject({'msg':'沒有該項商品'})
      // }
      
      const setting = neweb_config.setting.test;           //讀取設定檔(測試/正式)
      const common = neweb_config.setting.common;
      /* 商品名稱 */
      const ntd = exchange.coin;										 	// 商品價格
      const order_title = exchange.coin + ' 搞幣 送 ' + exchange.dividend + ' 紅利'; // 商品名稱
      const merchant_order_no = exchange.merchant_order_no = neweb_sdk.get_order_no(); //商品訂單編號
      /* 金流基本參數 */
      const merchant_id = setting.merchant_id;     //商店ID
      const hash_key = setting.hash_key;           //hash_key
      const hash_iv = setting.hash_iv;             //hash_iv
      const cashflow_url = setting.cashflow_url;   //金流網址
      const ver = common.ver;                   //版本
   
      /* 金流-藍新資料 */
      const expire_date_format = modules.moment(new Date()).add(common.expire_date_num, 'days').format('YYYY-MM-DD');
      const time_stamp = modules.moment().unix();
      // const serial_number = modules.moment().format('YYYYMMDDHHMMSS');
      
      createOrder(exchange, uid);                     //建立訂單到資料庫
      const trade_info_arr = {
        MerchantID: merchant_id,                      // 商店ID
        RespondType: 'JSON',                          // 回傳格式(預設JSON)
        TimeStamp: time_stamp,                        // 訂單時間戳記
        Version: ver,                                 // 版本
        MerchantOrderNo: merchant_order_no,           // 訂單編號
        Amt: ntd,                                     // 訂單價格
        ItemDesc: order_title,
        ReturnURL: setting.return_url,           // 交易成功/失敗網址
        NotifyURL: setting.notify_mpg_url,       // 支付通知網址
        ClientBackURL: setting.client_back_url,  // 返回網址
        ExpireDate: expire_date_format                // 繳款到期日
        // CustomerURL: neweb_config.CustomerURL,     // 商店取號網址
        // serial_number: serial_number,             // 訂單編號
      };

      const trade_info = await neweb_sdk.create_mpg_aes_encrypt(trade_info_arr, hash_key, hash_iv);  //產生加密交易資訊
      const sha256 = await neweb_sdk.SHA256(neweb_sdk.SHA_str(hash_key, trade_info, hash_iv)).toString().toUpperCase();  //產生sha256資訊
      const checkout = await neweb_sdk.CheckOut(cashflow_url, merchant_id, trade_info, sha256, ver);  //送出資訊到金流網址

      resolve(checkout);
    } catch (err) {
      reject(err);
    }
  });
}
async function createOrder(exchange, uid) {
  /* 寫入交易資料，未付款(status=0) */
  //  const serial_number = uid + '_' + modules.moment().format('YYYYMMDDHHMMSS');
  const scheduled = modules.moment().unix();
  await db.sequelize.query(
    `
    INSERT INTO cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real, serial_number, scheduled) VALUES (:uid, :money, :money_real, :coin, :coin_real, :dividend, :dividend_real, :serial_number, :scheduled)
    `,
    {
      logging: true,
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
  // resolve(insert);
}
module.exports = mpgModel;
