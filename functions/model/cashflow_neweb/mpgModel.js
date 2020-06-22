const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const neweb_config = require('../../config/cashflow/neweb_config');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function mpgModel(exchange) {
  exchange.coin = 50;
  createTicket(exchange);
  return new Promise(async function(resolve, reject) {
    try {
      /* 商品名稱 */

      const NTD = exchange.coin;										 	// 商品價格
      const Order_Title = exchange.coin + '搞幣'; // 商品名稱
      const ATM_ExpireDate = 3; // ATM付款到期日
      /* 金流基本參數 */
      const MerchantID = neweb_config.merchantID;
      const HashKey = neweb_config.hashKey;
      const HashIV = neweb_config.hashIV;
      const URL = neweb_config.url;
      const VER = neweb_config.ver;

      /* 金流-藍新資料 */
      const expire_date = modules.moment(new Date()).add(ATM_ExpireDate, 'days').format('YYYY-MM-DD');
      const serial_number = modules.moment(new Date()).format('YYYYMMDDHHMMSS');
      // const serial_number_unix = modules.moment(new Date()).unix();

      const trade_info_arr = {
        MerchantID: MerchantID,
        serial_number: serial_number,
        RespondType: 'JSON',
        TimeStamp: 1485232229,
        Version: VER,
        MerchantOrderNo: neweb_sdk.getOrderNo(),
        Amt: NTD,
        ItemDesc: Order_Title,
        ReturnURL: neweb_config.ReturnURL, // 支付完成 返回商店網址
        NotifyURL: neweb_config.NotifyMpgURL, // 支付通知網址
        CustomerURL: neweb_config.CustomerURL, // 商店取號網址
        ClientBackURL: neweb_config.ClientBackURL,
        ExpireDate: expire_date
      };

      const TradeInfo = await neweb_sdk.create_mpg_aes_encrypt(trade_info_arr, HashKey, HashIV);
      const SHA256 = await neweb_sdk.SHA256(neweb_sdk.SHA_str(HashKey, TradeInfo, HashIV)).toString().toUpperCase();
      const checkout = await neweb_sdk.CheckOut(URL, MerchantID, TradeInfo, SHA256, VER);

      resolve(checkout);
    } catch (err) {
      reject(err);
    }
  });
}
async function createTicket(exchange) {
  /* 寫入交易資料，未付款(status=0) */
  const ret = JSON.stringify(exchange.coin);
  //  console.log(exchange);return;
  const insert = await db.sequelize.query(
    `
    INSERT INTO cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real, serial_number) VALUES ('33333', 3, 3, 3, 3, 1, 1, :ret)
    `,
    {
      replacements: {
        ret: ret
      },
      type: db.sequelize.QueryTypes.INSERT
    }
  );
  resolve(insert);
}
module.exports = mpgModel;
