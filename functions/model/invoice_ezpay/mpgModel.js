const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const ezpay_config = require('../../config/invoice/ezpay_config');
const httpBuildQuery = require('http-build-query');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function mpgModel(res) {

//   const exchange = res.body;
//   const uid = res.token.uid;
  
  return new Promise(async function(resolve, reject) {
    try {

        /*商品名稱*/
       
        // const NTD = exchange.coin;						\				 	//商品價格
        // const Order_Title = exchange.coin + "搞幣";		   //商品名稱
        // const ATM_ExpireDate = 1;						            //ATM付款到期日
        /* 金流基本參數*/
        
        const setting = ezpay_config.setting.test;           //讀取設定檔(測試/正式)
        const common = ezpay_config.setting.common;
        
        const merchant_id = setting.merchant_id;

        const HashKey = setting.hash_key;
        const HashIV = setting.hash_iv;
        const php_sdk_url = 'https://test.gets-info.com/invoice/invoice_sdk.php';
        const cashflow_url = setting.cashflow_url;
        const ver = common.ver;
        
        /* 電子發票-ezpay */
        // const expire_date = modules.moment(new Date()).add(ATM_ExpireDate, 'days').format('YYYY-MM-DD');
        // const serial_number = modules.moment(new Date()).format('YYYYMMDDHHMMSS');
        // exchange.merchant_order_no = neweb_sdk.getOrderNo();
        const time_stamp = modules.moment().unix();
        // const now_format = modules.moment().format('YYYY-MM-DD');
        // console.log(now_format);
        // createTicket(exchange, uid);

        const hash = {
          'hash_key':HashKey,
          'hash_iv': HashIV
        };
        const trade_info_arr = {
            'RespondType':'JSON',
            'Version':'1.4',
            'TimeStamp':time_stamp, 
            'MerchantOrderNo':'12345678910134123124',
            'Status':'1',
            'Category':'B2C',
            'BuyerName':'UserName',
            'PrintFlag':'Y',
            'TaxType':'1',
            'TaxRate':'5',
            'Amt':'274',
            'TaxAmt':'14',
            'TotalAmt':'288',
            'ItemName':'商品一', 
            'ItemCount':'1', 
            'ItemUnit':'個',
            'ItemPrice':'288', 
            'ItemAmt':'288'
        }
        const post_data = {
          'hash':hash,
          'trade_info_arr':trade_info_arr,
        }
   
    var request = require('request');
 
    request(
        {
        method:'post',
        url:php_sdk_url, 
        form: post_data,
    }, function (error, response, body) {
        const trade_arr = {
          "MerchantID_":merchant_id,
          "PostData_":body.trim()
        };
        request(
            {
            method:'post',
            url:cashflow_url, 
            form: trade_arr
        }, function (error, response, checkout) {
          resolve(checkout);
        });
    }); 
 
    } catch (err) {
      reject(err);
    }
  });
}

// async function createTicket(exchange, uid)
// {
//    /*寫入交易資料，未付款(status=0)*/
//   //  const serial_number = uid + '_' + modules.moment().format('YYYYMMDDHHMMSS');
//    const scheduled = modules.moment().unix();
//    const insert = await db.sequelize.query(
//     `
//     INSERT INTO cashflow_deposits (uid, money, money_real, coin, coin_real, dividend, dividend_real, serial_number, scheduled) VALUES (:uid, :money, :money_real, :coin, :coin_real, :dividend, :dividend_real, :serial_number, :scheduled)
//     `,
//     {
//       logging:true,
//       replacements: {
//         uid:uid,
//         money:exchange.coin,
//         money_real:exchange.coin,
//         coin:exchange.coin,
//         coin_real:exchange.coin,
//         dividend:exchange.dividend,
//         dividend_real:exchange.dividend,
//         serial_number:exchange.merchant_order_no,
//         scheduled:scheduled
//       },
//       type: db.sequelize.QueryTypes.INSERT
//     }
//   );
//   resolve(insert);
// }
module.exports = mpgModel;
