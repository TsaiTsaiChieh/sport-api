/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModule = require('../../util/messageModule');

function createMessage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {};
      insertData.createTime = modules.firebaseAdmin.firestore.Timestamp.now();

      /* get user according token */
      const userSnapshot = await modules.getSnapshot(
        process.env.usersCollection,
        args.token.uid
      );
      /* step1: check if user exists */
      if (!userSnapshot.exists) {
        reject({ code: 400, error: 'user not exist' });
        return;
      }
      /* step2: check user block message time */
      if (userSnapshot.data().blockMessage._seconds * 1000 > new Date()) {
        reject({ code: 400, error: 'user had been muted' });
        return;
      }
      /* step3: get reply message info (future can be written as function) */
      if (args.reply) {
        const messageSnapshot = await modules.getSnapshot(
          `chat_${args.message.channelId}`,
          args.reply.messageId
        );
        /* messageId did not exist return 400 error */
        /* second condition is soft delete logic: if -1 (admin delete) or 0 (user delete) return error */
        if (
          !messageSnapshot.data() ||
          messageSnapshot.data().message.softDelete <= 0
        ) {
          reject({ code: 400, error: 'message/file not exist' });
          return;
        }
        /* deny user reply the message which deleted by user himself/herself */
        if (
          args.token.uid === messageSnapshot.data().user.uid &&
          messageSnapshot.data().message.softDelete === 1
        ) {
          reject({
            code: 400,
            error: 'can not reply message which deleted by user himself/herself'
          });
          return;
        }
        const reply = messageModule.repackageMessageData(
          messageSnapshot.data()
        );
        insertData.reply = reply;
      }
      /* step3: get insert doc id */
      const messageDoc = modules.firestore
        .collection(`chat_${args.message.channelId}`)
        .doc();
      const messageId = messageDoc.id;
      const user = messageModule.repackageUserData(userSnapshot.data());

      insertData.message = {
        channelId: args.message.channelId,
        message: args.message.message,
        type: args.message.type,
        tempHash: args.message.tempHash,
        messageId: messageId,
        softDelete: 2 /* 2 is default and normal */
      };
      insertData.user = user;
      /* add message data to firestore & realtime */
      messageDoc.set(insertData);
      modules.database
        .ref(`chat_${args.message.channelId}`)
        .child(messageId)
        .set(insertData);
      resolve(insertData);
    } catch (err) {
      console.log('錯誤發生', err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createMessage;