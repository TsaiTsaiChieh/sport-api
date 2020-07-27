// const test_url = 'https://dosports.web.app/';
// const test_api_url = 'https://api-dosports.web.app/';
const test_cashflow_url = 'https://cinv.ezpay.com.tw/Api/invoice_issue';
// const official_url = 'https://getsports.web.app/';
// const official_api_url = 'https://api-getsports.web.app/';
const official_cashflow_url = 'https://inv.ezpay.com.tw/Api/invoice_issue';
const setting = {
  test: {
    merchant_id: '32509619', // 商店代號
    hash_key: 'POlEjUEQb8M66hIQWG8RtFkQStBS0nLU', // HashKey
    hash_iv: 'CF9oMwW9CyVopneP', // HashIV
    // 'base_url':test_url,                                          // 網站路徑
    // 'api_url': test_api_url,                                      // API路徑
    cashflow_url: test_cashflow_url // 測試環境URL
    // 'return_url': test_url + 'cashflow_neweb/thanks',             //交易成功/失敗頁面
    // 'notify_mpg_url': test_api_url + 'cashflow_neweb/mpg_notify', //背景回傳路徑
    // 'client_back_url': test_url + 'get-points'                    //返回頁面
  },
  official: {
    merchant_id: '314724448',
    hash_key: 'lDt2AE1Ql3lZTYsyC71lWMteDBB3qk74',
    hash_iv: 'PMVhpeaz7d0ThHIC',
    // 'base_url': official_url,
    // 'api_url': official_api_url,
    cashflow_url: official_cashflow_url
    // 'return_url': official_url + 'cashflow_neweb/thanks',
    // 'notify_mpg_url': official_api_url + 'cashflow_neweb/mpg_notify',
    // 'client_back_url': official_url + 'get-points'
  },
  common: {
    ver: '1.4', // 介接版本
    expire_date_num: 1, // 共用付款到期日(預設為1天)
    tax_type: 1,
    tax_rate: 5,
    print_flag: 'N', // 索取紙本發票
    category: 'B2C', // 發票種類
    status: '1', // 開立發票方式
    php_sdk_url: 'https://test.gets-info.com/invoice/invoice_sdk.php'
  }
};

module.exports = {
  setting
};

// const merchantID = '32509619'; 																					// 商店代號
// const hashKey = 'POlEjUEQb8M66hIQWG8RtFkQStBS0nLU'; 																					// HashKey
// const hashIV = 'CF9oMwW9CyVopneP'; 																					// HashIV
// const url = 'https://cinv.ezpay.com.tw/Api/invoice_issue'; // 測試環境URL
// const ver = '1.4';

// const test_url = 'https://dosports.web.app';
// const apidosports = 'https://api-dosports.web.app';
// const ReturnURL = test_url + '/cashflow_neweb/thanks'; // 支付完成 返回商店網址
// const NotifyURL_atm = test_url + '/cashflow_neweb/atm_notify'; 		// ATM   支付通知網址
// const NotifyURL_webatm = test_url + '/cashflow_neweb/webatm_notify'; // WEBATM   支付通知網址
// const NotifyURL_barcode = test_url + '/cashflow_neweb/barcode_notify'; 	// BARCODE   支付通知網址
// const NotifyURL_code = test_url + '/cashflow_neweb/code_notify'; 		// CODE   支付通知網址
// const NotifyURL_ccard = test_url + '/cashflow_neweb/ccard_notify'; 	// 信用卡 支付通知網址
// const NotifyMpgURL = apidosports + '/cashflow_neweb/mpg_notify'; // MPG notify url
// const ClientBackURL = test_url + '/get-points/'; 					// 支付取消 返回商店網址

// const ATM_ExpireDate = 10; // ATM付款到期日

// module.exports = {
//   merchantID,
//   hashKey,
//   hashIV,
//   url,
//   ver,
//   ReturnURL,
//   NotifyURL_atm,
//   NotifyURL_webatm,
//   NotifyURL_barcode,
//   NotifyURL_code,
//   NotifyURL_ccard,
//   NotifyMpgURL,
//   ClientBackURL,
//   ATM_ExpireDate
// };
