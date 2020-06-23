const moment = require('moment');
const httpBuildQuery = require('http-build-query');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
/* HashKey AES 加解密 */
function create_mpg_aes_encrypt(parameter = '', key = '', iv = '') {
  return_str = '';
  if (parameter !== '') {
    // 將參數經過 URL ENCODED QUERY STRING
    return_str = httpBuildQuery(parameter);
  }

  const cipher = CryptoJS.AES.encrypt(return_str, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  return cipher.ciphertext;
}

// /*HashKey AES 解密 */
// function create_aes_decrypt($parameter = "", $key = "", $iv = "") {
//  return strippadding(openssl_decrypt(hex2bin($parameter),'AES-256-CBC', $key, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, $iv));
// }

// function strippadding($string) {
//  $slast = ord(substr($string, -1));
//  $slastc = chr($slast);
//  $pcheck = substr($string, -$slast);
//  if (preg_match("/$slastc{" . $slast . "}/", $string)) {
//  $string = substr($string, 0, strlen($string) - $slast);
//  return $string;
//  } else {
//  return false;
//  }
// }

function create_mpg_aes_decrypt(encryptedBase64Str, key, iv) {

  var encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedBase64Str);

  var encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  var decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
  return decryptedStr;
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
  console.log(szHtml);

  return szHtml;
}
/* 取得訂單編號 */
function getOrderNo() {
  /* 需加入預設時區 */
  const serial_number = moment().format('YYYYMMDDHHMMSS');
  return serial_number;
}

module.exports = {
  getOrderNo,
  create_mpg_aes_encrypt,
  create_mpg_aes_decrypt,
  SHA_str,
  SHA256,
  CheckOut
};
