
const test_url = 'https://dosports.web.app/';
const test_api_url = 'https://api-dosports.web.app/';
const test_cashflow_url = 'https://ccore.newebpay.com/MPG/mpg_gateway';
const official_url = 'https://getsports.web.app/';
const official_api_url = 'https://api-getsports.web.app/';
const official_cashflow_url = 'https://core.newebpay.com/MPG/mpg_gateway';
const setting = {
  'test':{
    'merchant_id':'MS311997730',                                   // 商店代號
    'hash_key':'AlrsIeyCp6BKNn9pDGcSO1lxtm8T90KF',								  // HashKey
    'hash_iv':'C454ZaIyVYTvWLcP',										              // HashIV
    'base_url':test_url,                                          // 網站路徑
    'api_url': test_api_url,                                      // API路徑
    'cashflow_url':test_cashflow_url,                             // 測試環境URL
    'return_url': test_url + 'cashflow_neweb/thanks',             //交易成功/失敗頁面
    'notify_mpg_url': test_api_url + 'cashflow_neweb/mpg_notify', //背景回傳路徑
    'client_back_url': test_url + 'get-points'                    //返回頁面
  },
  'official':{
    'merchant_id':'MS3360364315',
    'hash_key':'5EF4PzcwCli0aujr4Bvkq27julx6DwA6',																				
    'hash_iv':'Pxgn7Vb2bnGVQSyC',									
    'base_url': official_url,
    'api_url': official_api_url,
    'cashflow_url':official_cashflow_url,
    'return_url': official_url + 'cashflow_neweb/thanks',
    'notify_mpg_url': official_api_url + 'cashflow_neweb/mpg_notify',
    'client_back_url': official_url + 'get-points'
  },
  'common':{
    'ver':'1.5', //介接版本
    'expire_date_num':1 // 共用付款到期日(預設為1天)
  }
}

module.exports = {
  setting
};
