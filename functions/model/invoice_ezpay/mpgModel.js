const neweb_sdk = require('../../util/cashflow_sdk/neweb_sdk');
const ezpay_config = require('../../config/invoice/ezpay_config');
const modules = require('../../util/modules');
const db = require('../../util/dbUtil');
async function mpgModel(data) {
  return new Promise(async function(resolve, reject) {
    try {
        
      await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('invoice1')`);
      const data_str = JSON.stringify(data.MerchantOrderNo);

      await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('${data_str}')`);
        /* 依照訂單編號撈取使用者資料 */
        const deposit = await db.CashflowDeposit.findOne({
          where: {
            serial_number: data.MerchantOrderNo
          },
          attributes: ['uid', 'order_status']
        })

        const user = await db.User.findOne({
          where: {
            uid: deposit.uid
          },
          attributes: ['name', 'email']
        })

        const user_str = JSON.stringify(user);
        await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('${user_str}')`);
        data.tax_amt = Math.floor(data.Amt * 0.05);
        data.amt_minus_tax = data.Amt - data.tax_amt;
      
        const data2 = {
          MerchantOrderNo: data.MerchantOrderNo,
          name: user.name,
          email : user.email,
          amt:data.amt_minus_tax,
          tax_amt: data.tax_amt,
          total_amt:data.Amt,
          item_name:'搞幣', 
          item_count:1, 
          item_unit:'元',
          item_price: data.Amt, 
          item_amt: data.Amt,
          CarrierNum:'/XU6NMDR'
        }

        console.log(data2);
        const data2_str = JSON.stringify(data2);
        await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('${data2_str}')`);

        data = data2;

        console.log(data);
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
        await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('invoice3')`);
        const hash = {
          'hash_key':HashKey,
          'hash_iv': HashIV
        };
        const trade_info_arr = {
            'CarrierType':0,
            'CarrierNum': data.CarrierNum,
            'RespondType':'JSON',
            'Version':ver,
            'TimeStamp':time_stamp, 
            'MerchantOrderNo':data.MerchantOrderNo,
            'Status':common.status,
            'Category':common.category,
            'BuyerName': data.name,
            'BuyerEmail': data.email,
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

        const test_str = JSON.stringify(trade_info_arr);
        await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('${test_str}')`);
        console.log(trade_info_arr);
        const post_data = {
          'hash':hash,
          'trade_info_arr':trade_info_arr,
        }
        const post_data_arr = JSON.stringify(post_data);
        await db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('${post_data_arr}')`);
    var request = require('request');
 
    request(
        {
        method:'post',
        url:php_sdk_url, 
        form: post_data,
    }, function (error, response, body) {
       db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('invoice5')`);
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
          const res1 = JSON.stringify(checkout);
           db.sequelize.query(`INSERT INTO invoice_tests (content) VALUES ('${res1}')`);
          resolve(checkout);
        });
    }); 
 
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgModel;
