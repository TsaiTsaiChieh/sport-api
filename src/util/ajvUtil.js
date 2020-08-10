const Ajv = require('ajv');
const { firebaseConfig } = require('../config/env_values');
// AJV reference document : https://ajv.js.org/
// RegExp reference document : https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Regular_Expressions

const generalString = new RegExp("[ _`~!@#$%^&*()+=|{}':;,\\[\\].<>/?！￥…（）【】‘；：”“’。，、？]");
const preventInjection = new RegExp("[_'`%\./‘”“’]");
// const specialCharacters = '!#$%&\'*+-/=?^_`{|}~';
const email2 = new RegExp('^[A-Za-z0-9_.-]+@[A-Za-z0-9.-]+$');
// const email2 = new RegExp('/A[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*z/');

const imgURL = new RegExp((`^https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}`));

module.exports = new Ajv({ allErrors: true, useDefaults: true })
  .addFormat('generalString', { // not allow special characters
    validate: (string) => !generalString.test(string)
  })
  .addFormat('preventInjection', { // prevent SQL injection
    validate: (string) => !preventInjection.test(string)
  })
  .addFormat('imgURL', { // upload img url
    validate: (string) => imgURL.test(string)
  })
  .addFormat('email2', { // upload img url
    validate: (string) => email2.test(string)
  })
;
