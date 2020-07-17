const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const ezpay_config = require('../../config/invoice/ezpay_config');
const httpBuildQuery = require('http-build-query');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function mpgModel(data) {

//   const exchange = res.body;
//   const uid = res.token.uid;
  
  return new Promise(async function(resolve, reject) {
    try {

        const data2 = {
          merchant_order_no:'20200717',
          username:'username',
          amt:'274',
          tax_amt:'14',
          total_amt:'288',
          item_name:'商品一', 
          item_count:1, 
          item_unit:'個',
          item_price:288, 
          item_amt:288
        }
        data = data2;
        /* 使用者名稱 */
        

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
          'hash_key':HashKey,
          'hash_iv': HashIV
        };
        const trade_info_arr = {
            'RespondType':'JSON',
            'Version':ver,
            'TimeStamp':time_stamp, 
            'MerchantOrderNo':data.merchant_order_no,
            'Status':common.status,
            'Category':common.category,
            'BuyerName':data.username,
            'BuyerEmail': 'henry@gets-info.com',
            'PrintFlag':common.print_flag,
            'TaxType':common.tax_type,
            'TaxRate':common.tax_rate,
            'Amt':data.amt,
            'TaxAmt':data.tax_amt,
            'TotalAmt':data.total_amt,
            'ItemName':data.item_name, 
            'ItemCount':data.item_count, 
            'ItemUnit':data.item_unit,
            'ItemPrice':data.item_price, 
            'ItemAmt':data.item_amt
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
