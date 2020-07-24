// const merchantID = "MS3360364315"; 																					//商店代號
// const hashKey    = "5EF4PzcwCli0aujr4Bvkq27julx6DwA6"; 																					//HashKey
// const hashIV     = "Pxgn7Vb2bnGVQSyC"; 																					//HashIV
// const url        = "https://ccore.newebpay.com/MPG/mpg_gateway"; //測試環境URL
// const ver        = "1.5";

// const ReturnURL       = "/cashflow_neweb/thanks.html"; 	     //支付完成 返回商店網址
// const NotifyURL_atm   = "/cashflow_neweb/atm_notify"; 		//ATM   支付通知網址
// const NotifyURL_webatm   = "/cashflow_neweb/webatm_notify"; 		//WEBATM   支付通知網址
// const NotifyURL_ccard = "/cashflow_neweb/ccard_notify"; 	    //信用卡 支付通知網址
// const ClientBackURL   = "/cashflow_neweb/"; 					//支付取消 返回商店網址



// const test_url = 'https://dosports.web.app/';
// const test_api_url = 'https://api-dosports.web.app/';
// const test_cashflow_url = 'https://ccore.newebpay.com/MPG/mpg_gateway';
const official_url = 'https://getsports.web.app/';
const official_api_url = 'https://api-getsports.web.app/';
const official_vm_api_url       = 'https://test.gets-info.com/Transaction_official.php';
const official_cashflow_url = 'https://api.eg.gashplus.com/CP_Module/order.aspx';
const transaction_return_url = 'https://test.gets-info.com/gash_return_url.php';
const setting = {
//   test: {
//     merchant_id: 'MS311997730', // 商店代號
//     hash_key: 'AlrsIeyCp6BKNn9pDGcSO1lxtm8T90KF', // HashKey
//     hash_iv: 'C454ZaIyVYTvWLcP', // HashIV
//     base_url: test_url, // 網站路徑
//     api_url: test_api_url, // API路徑
//     cashflow_url: test_cashflow_url, // 測試環境URL
//     return_url: test_url + 'cashflow_neweb/thanks', // 交易成功/失敗頁面
//     notify_mpg_url: test_api_url + 'cashflow_neweb/mpg_notify', // 背景回傳路徑
//     client_back_url: test_url + 'get-points' // 返回頁面
//   },
  official: {
    merchant_id: 'C007840001459',
    // hash_key: '5EF4PzcwCli0aujr4Bvkq27julx6DwA6',
    // hash_iv: 'Pxgn7Vb2bnGVQSyC',
    // base_url: official_url,
    // api_url: official_api_url,
    vm_api_url: official_vm_api_url,
    cashflow_url: official_cashflow_url,
    return_url: transaction_return_url,
    // notify_mpg_url: official_api_url + 'cashflow_neweb/mpg_notify',
    // client_back_url: official_url + 'get-points'
  },
  common: {
    // ver: '1.5', // 介接版本
    expire_date_num: 1 // 共用付款到期日(預設為1天)
  }
};

module.exports = {
  setting
};
