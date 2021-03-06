const firebaseAdmin = require('../../util/firebaseUtil');
const day = 1;
const db = require('../../util/dbUtil');
async function getUserInfo(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.findOne({
        attributes: [
          'uid',
          'status'
        ],
        where: {
          uid: uid
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

// like /message/delete
function deleteMessageWithId(args) {
  return new Promise(async function(resolve, reject) {
    // -1: admin delete, 0: user retract, 1: user delete
    try {
      const database = firebaseAdmin().database();
      const firestore = firebaseAdmin().firestore();
      const messageSnapshot = await firestore
        .collection(`chat_${args.channelId}`)
        .doc(args.messageId).get();
      const message = messageSnapshot.data();

      // if message did not exist, it would return undefined
      if (!message) {
        reject({
          code: 404,
          error: 'message/file not found'
        });
        return;
      }
      // -1, 0
      if (message.message.softDelete <= 0) {
        reject({ code: 410, error: 'message/file had been deleted' });
        return;
      }
      // 若使用者要收回(0) 或要刪除(1)，必須要本人
      if (args.deleteAction === 0) {
        if (args.token.uid === message.user.uid) {
          // if sender is the same user
          // if (message.message.softDelete === 1) {
          //   // same user want to delete/retract again
          //   reject({ code: 410, error: 'message/file had been deleted' });
          //   return;
          // }
          // user retract logic
          if (
            args.deleteAction === 0 &&
            message.createTime._seconds * 1000 + day * 24 * 60 * 60 * 1000 <
              Date.now()
          ) {
            reject({
              code: 403,
              error: 'message/file can only be retracted within one day'
            });
            return;
          }
          await firestore
            .collection(`chat_${args.channelId}`)
            .doc(args.messageId)
            .set(
              { message: { softDelete: args.deleteAction } },
              { merge: true }
            ); // when update a map, it will overwrite
        } else if (args.token.uid !== message.user.uid) {
          reject({
            code: 403,
            error: 'forbidden, please use report function'
          });
          return;
        }
      } else if (args.deleteAction === -1) {
        // const userSnapshot = await getSnapshot('users', args.token.uid);
        // const user = userSnapshot.data();
        const user = await getUserInfo(args.token.uid);
        if (user.status >= 9) {
          await firestore
            .collection(`chat_${args.channelId}`)
            .doc(args.messageId)
            .set(
              { message: { softDelete: args.deleteAction } },
              { merge: true }
            );
        }
      }
      // if 0, -1 => mask message
      if (args.deleteAction <= 0) {
        // udpate realtime database
        database
          .ref(`chat_${args.channelId}`)
          .child(args.messageId)
          .child('message')
          .update({
            message:
              args.deleteAction === 0
                ? '無法讀取原始訊息'
                : '此留言已被管理員移除',
            softDelete: args.deleteAction
          });
      }
      // before: if 1, just change softDelete
      // now: update mask_message
      if (args.deleteAction === 1) {
        // database
        //   .ref(`mask_message/${args.token.uid}/chat_${args.channelId}`)
        //   .set(args.messageId);
        database
          .ref(`mask_message/${args.token.uid}/chat_${args.channelId}`)
          .child(args.messageId)
          .set(1);
        // .set(args.messageId);
        // database
        //   .ref(`chat_${args.channelId}`)
        //   .child(args.messageId)
        //   .child('message')
        //   .update({
        //     softDelete: args.deleteAction
        //   });
      }
      resolve(`Delete message id: ${args.messageId} successful`);
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = deleteMessageWithId;
