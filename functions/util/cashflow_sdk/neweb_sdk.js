const moment = require('moment');
const httpBuildQuery = require('http-build-query');
const CryptoJS = require('crypto-js');
/* HashKey AES 加密 */
function create_mpg_aes_encrypt(parameter = '', key = '', iv = '') {
  let return_str = '';
  if (parameter !== '') {
    // 將參數經過url encoded query string
    return_str = httpBuildQuery(parameter);
  }
  const cipher = CryptoJS.AES.encrypt(return_str, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv), // 解析IV
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return cipher.ciphertext;
}

/* HashKey AES 解密 */
function create_mpg_aes_decrypt(encryptedBase64Str, key, iv) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedBase64Str);
  encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  
  const decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv), // 解析IV
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return decryptedData.toString(CryptoJS.enc.Utf8);
}

/* HashIV SHA256 加密 */
function SHA_str(key = '', tradeinfo = '', iv = '') {
  const HashIV_Key = 'HashKey=' + key + '&' + tradeinfo + '&HashIV=' + iv;

  return HashIV_Key;
}

function SHA256(str) {
  const sha = CryptoJS.SHA256(str);
  return sha;
}

function CheckOut(URL = '', MerchantID = '', TradeInfo = '', SHA256 = '', VER = '') {
  let szHtml = '<!doctype html>';
  szHtml += '<html>';
  szHtml += '<head>';
  szHtml += '<meta charset="utf-8">';
  szHtml += '</head>';
  szHtml += '<body>';
  szHtml += '<form name="newebpay" id="newebpay" method="post" action="' + URL + '" style="display:none;">';
  szHtml += '<input type="text" name="MerchantID" value="' + MerchantID + '" type="hidden">';
  szHtml += '<input type="text" name="TradeInfo" value="' + TradeInfo + '"   type="hidden">';
  szHtml += '<input type="text" name="TradeSha" value="' + SHA256 + '" type="hidden">';
  szHtml += '<input type="text" name="Version"  value="' + VER + '" type="hidden">';
  szHtml += '</form>';
  szHtml += '<script type="text/javascript">';
  szHtml += 'document.getElementById("newebpay").submit();';
  szHtml += '</script>';
  szHtml += '</body>';
  szHtml += '</html>';
  // console.log(szHtml);

  return szHtml;
}
/* 取得訂單編號 */
function get_order_no() {
  /* 需加入預設時區 */
  const serial_number = moment().format('YYYYMMDDHHMMSS');//訂單格式
  return serial_number;
}

module.exports = {
  get_order_no,
  create_mpg_aes_encrypt,
  create_mpg_aes_decrypt,
  SHA_str,
  SHA256,
  CheckOut
};
