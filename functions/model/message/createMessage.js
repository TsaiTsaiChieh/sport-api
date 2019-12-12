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
      // get insert doc id
      const messageDoc = modules.firestore
        .collection(`chat_${args.message.channelId}`)
        .doc();
      const messageId = messageDoc.id;
      // get user according token
      const userSnapshot = await modules.getSnapshot(
        process.env.usersCollection,
        args.token.uid
      );
      // Q: if user not exist?
      const user = messageModule.repackageUserData(userSnapshot.data());
      // get reply message info (future can be written as function)
      if (args.reply) {
        const messageSnapshot = await modules.getSnapshot(
          `chat_${args.message.channelId}`,
          args.reply.messageId
        );
        // messageId not exist return 400 error
        if (!messageSnapshot.data()) {
          reject({ code: 400, error: 'message/file not exist' });
          return;
        }
        const reply = messageModule.repackageMessageData(
          messageSnapshot.data()
        );
        insertData.reply = reply;
      }
      insertData.message = {
        channelId: args.message.channelId,
        message: args.message.message,
        type: args.message.type,
        tempHash: args.message.tempHash,
        messageId: messageId,
        softDelete: 2 // 2 is default and normal
      };
      insertData.user = user;
      // add message data to firestore & realtime
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
