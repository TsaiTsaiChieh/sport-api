const moment = require('moment');
const httpBuildQuery = require('http-build-query');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const sha256JS = require('js-sha256');
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
  console.log(CryptoJS.enc.Utf8.parse(iv));
  // var encryptedData = CryptoJS.AES.encrypt(return_str, key, {
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7
  // });
  // console.log(cipher.ciphertext.toString());return;
  // let cipher = encrypt(return_str, key, iv);
  // console.log(decrypt(cipher, key, iv));

  // console.log(enc);
  // return bin2hexJS(openssl_encrypt(addpadding(return_str), 'aes-256-cbc', key, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, iv)).trim();
  // console.log(cipher);
  // return;
  return cipher.ciphertext;
}

function encrypt2(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(SECRET), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function encrypt(val, ENC_KEY, IV) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

function decrypt(val, ENC_KEY, IV) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  const decrypted = decipher.update(val, 'base64', 'utf8');
  return (decrypted + decipher.final('utf8'));
};

function addpadding(string, blocksize = 32) {
  const len = string.length;
  const pad = blocksize - (len % blocksize);
  string += (pad.charCodeAt).repeat(pad);

  return string;
}

function bin2hexJS(s) {
  //  discuss at: https://locutus.io/php/bin2hex/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // bugfixed by: Linuxworld
  // improved by: ntoniazzi (https://locutus.io/php/bin2hex:361#comment_177616)
  //   example 1: bin2hex('Kev')
  //   returns 1: '4b6576'
  //   example 2: bin2hex(String.fromCharCode(0x00))
  //   returns 2: '00'

  var i;
  var l;
  var o = '';
  var n;

  s += '';

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i)
      .toString(16);
    o += n.length < 2 ? '0' + n : n;
  }

  return o;
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

/* HashIV SHA256 加密 */
function SHA_str(key = '', tradeinfo = '', iv = '') {
  const HashIV_Key = 'HashKey=' + key + '&' + tradeinfo + '&HashIV=' + iv;

  return HashIV_Key;
}

function SHA256(str) {
  const sha = CryptoJS.SHA256('ajsdlfknasldfnsadk');
  // console.log(sha);return;
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
  console.log(szHtml); return;
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
  SHA_str,
  SHA256,
  CheckOut
};
