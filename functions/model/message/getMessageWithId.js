/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModule = require('../../util/messageModule');

function getMessageWithId(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const messageSnapshot = await modules.getSnapshot('messages', id);
      const message = messageSnapshot.data();
      let body = {};
      if (message) {
        const userSnapshot = await modules.getSnapshot('users', message.uid);
        const user = userSnapshot.data();
        if (user) {
          body = messageModule.repackageMessageData(message, user, 0);
        } else {
          reject({
            code: 400,
            error: 'This user did does not exist (輸入的使用者 uid 不存在)'
          });
        }
      } else {
        reject({
          code: 400,
          error: 'This message id does not exist (輸入的訊息 id 不存在)'
        });
      }
      resolve(body);
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getMessageWithId;
