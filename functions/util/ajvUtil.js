const Ajv = require('ajv');
const { firebaseConfig } = require('../config/env_values');
// AJV reference document : https://ajv.js.org/
// RegExp reference document : https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Regular_Expressions

const generalString = new RegExp("[ _`~!@#$%^&*()+=|{}':;,\\[\\].<>/?！￥…（）【】‘；：”“’。，、？]");
const preventInjection = new RegExp("[_'`%\./‘”“’]");
// const specialCharacters = '!#$%&\'*+-/=?^_`{|}~';
const email2 = new RegExp('^[A-Za-z0-9_.-]+@[A-Za-z0-9.-]+$');
// const email2 = new RegExp('/A[a-zA-Z0-9.!#$%&\'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*z/');

// URI::MailTo::EMAIL_REGEXP
//
// => /\A[a-zA-Z0-9.!\#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\z/
//

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
// const schema = {
//   required: ['eventID'],
//   properties: {
//     eventID: {
//       type: 'string'
//     }
//   }
// };

// const valid = ajv.validate(schema, req.query);
// if (!valid) {
//   return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);
// }
// channelId: { type: 'string', enum: ['public'] },
// const schema = {
//   type: 'object',
//   required: ['display_name', 'name', 'phone', 'email', 'birthday'],
//   properties: {
//     display_name: { type: 'string', minLength: 2, maxLength: 15, format: 'generalString' },
//     name: { type: 'string', minLength: 2, maxLength: 10, format: 'generalString' },
//     country_code: { type: 'string', minLength: 2, maxLength: 4, format: 'generalString' },
//     phone: { type: 'string', minLength: 9, maxLength: 10, format: 'generalString' },
//     email: { type: 'string', format: 'email' },
//     birthday: { type: 'integer' },
//     avatar: { type: 'string', format: 'imgURL' },
//     signature: { type: 'string', maxLength: 20, format: 'preventInjection' }
//   }
// };
