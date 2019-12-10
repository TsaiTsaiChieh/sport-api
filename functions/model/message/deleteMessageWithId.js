/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
// const messageModule = require('../../util/messageModule');

// like /message/delete
function deleteMessageWithId(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const messageSnapshot = await modules.getSnapshot('messages', args.id);
      const message = messageSnapshot.data();
      // if message did not exist, it would return undefined
      if (!message) {
        reject({
          code: 404,
          error: 'This message id does not exist (輸入的訊息 id 不存在)'
        });
      }
      // 1,-1,0
      if (Math.abs(message.softDelete) <= 1) {
        reject({ code: 409, error: 'Message had been deleted (訊息已被刪除)' });
        // resolve(message.softDelete);
      }

      if (args.deleteAction === 0 || args.deleteAction === 1) {
        if (args.token.uid === message.uid) {
          // if sender is the same user
          await modules.getDoc('messages', args.id).update({
            softDelete: args.deleteAction
          });
        } else if (args.token.uid !== message.uid) {
          reject({
            code: 403,
            error: 'Forbidden, please use report function'
          });
        } else if (args.deleteAction === -1) {
          const userSnapshot = await modules.getSnapshot(
            'users',
            args.token.uid
          );
          const user = userSnapshot.data();
          if (user.userStats === 9) {
            await modules.getDoc('messages', args.id).update({
              softDelete: args.deleteAction
            });
          }
        }
      } else {
        reject({
          code: 403,
          error: 'Forbidden, please use report function'
        });
      }
      resolve(`Delete id: ${args.id} in messages collection successful`);
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = deleteMessageWithId;
