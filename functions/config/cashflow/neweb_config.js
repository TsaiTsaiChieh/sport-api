const merchantID = 'MS311997730'; 																					// 商店代號
const hashKey = 'AlrsIeyCp6BKNn9pDGcSO1lxtm8T90KF'; 																					// HashKey
const hashIV = 'C454ZaIyVYTvWLcP'; 																					// HashIV
const url = 'https://ccore.newebpay.com/MPG/mpg_gateway'; // 測試環境URL
const ver = '1.5';

const test_url = 'https://dosports.web.app/';
const ReturnURL = test_url + '/cashflow_neweb/thanks.html'; // 支付完成 返回商店網址
const NotifyURL_atm = test_url + '/cashflow_neweb/atm_notify'; 		// ATM   支付通知網址
const NotifyURL_webatm = test_url + '/cashflow_neweb/webatm_notify'; 		// WEBATM   支付通知網址
const NotifyURL_ccard = test_url + '/cashflow_neweb/ccard_notify'; // 信用卡 支付通知網址
const ClientBackURL = test_url + '/cashflow_neweb/'; 					// 支付取消 返回商店網址

const ATM_ExpireDate = 3;						// ATM付款到期日

module.exports = {
  merchantID,
  hashKey,
  hashIV,
  url,
  ver,
  ReturnURL,
  NotifyURL_atm,
  NotifyURL_webatm,
  NotifyURL_ccard,
  ClientBackURL,
  ATM_ExpireDate
};
