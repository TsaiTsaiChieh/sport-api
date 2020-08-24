// const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const ezpay_config = require('../../config/invoice/ezpay_config');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
const request = require('request');
async function mpgModel(data) {
  return new Promise(async function(resolve, reject) {
    try {
      /* 依照訂單編號撈取使用者資料 */
      const deposit = await db.CashflowDeposit.findOne({
        where: {
          serial_number: data.MerchantOrderNo
        },
        attributes: ['uid', 'order_status']
      });

      const user = await db.User.findOne({
        where: {
          uid: deposit.uid
        },
        attributes: ['name', 'email']
      });

      data.tax_amt = Math.floor(data.Amt * 0.05);
      data.amt_minus_tax = data.Amt - data.tax_amt;

      const data2 = {
        MerchantOrderNo: data.MerchantOrderNo,
        name: user.name,
        email: user.email,
        amt: data.amt_minus_tax,
        tax_amt: data.tax_amt,
        total_amt: data.Amt,
        item_name: '搞幣',
        item_count: 1,
        item_unit: '元',
        item_price: data.Amt,
        item_amt: data.Amt,
        CarrierNum: user.invoice_carrier
      };

      data = data2;

      // console.log(data);
      /* 金流基本參數 */
      const setting = ezpay_config.setting.official; // 讀取設定檔(測試/正式)
      const common = ezpay_config.setting.common;

      const merchant_id = setting.merchant_id;

      const HashKey = setting.hash_key;
      const HashIV = setting.hash_iv;
      const php_sdk_url = common.php_sdk_url;
      const cashflow_url = setting.cashflow_url;
      const ver = common.ver;
      const time_stamp = modules.moment().unix();
      /* 電子發票-ezpay */
      // const expire_date = modules.moment(new Date()).add(ATM_ExpireDate, 'days').format('YYYY-MM-DD');
      // const serial_number = modules.moment(new Date()).format('YYYYMMDDHHMMSS');
      // exchange.merchant_order_no = neweb_sdk.getOrderNo();

      // const now_format = modules.moment().format('YYYY-MM-DD');
      // console.log(now_format);
      // createTicket(exchange, uid);
      const hash = {
        hash_key: HashKey,
        hash_iv: HashIV
      };
      const trade_info_arr = {
        CarrierType: 0,
        CarrierNum: data.CarrierNum,
        RespondType: 'JSON',
        Version: ver,
        TimeStamp: time_stamp,
        MerchantOrderNo: data.MerchantOrderNo,
        Status: common.status,
        Category: common.category,
        BuyerName: data.name,
        BuyerEmail: data.email,
        PrintFlag: common.print_flag,
        TaxType: common.tax_type,
        TaxRate: common.tax_rate,
        Amt: data.amt,
        TaxAmt: data.tax_amt,
        TotalAmt: data.total_amt,
        ItemName: data.item_name,
        ItemCount: data.item_count,
        ItemUnit: data.item_unit,
        ItemPrice: data.item_price,
        ItemAmt: data.item_amt
      };

      console.log(trade_info_arr);
      const post_data = {
        hash: hash,
        trade_info_arr: trade_info_arr
      };

      request(
        {
          method: 'post',
          url: php_sdk_url,
          form: post_data
          // eslint-disable-next-line handle-callback-err
        }, function(error, response, body) {
          const trade_arr = {
            MerchantID_: merchant_id,
            PostData_: body.trim()
          };
          request(
            {
              method: 'post',
              url: cashflow_url,
              form: trade_arr
              // eslint-disable-next-line handle-callback-err
            }, function(error, response, checkout) {
              resolve(checkout);
            });
        });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgModel;
