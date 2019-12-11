/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModule = require('../../util/messageModule');

function createMessage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {};
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
      // get reply message info
      if (args.reply) {
        const messageSnapshot = await modules.getSnapshot(
          `chat_${args.message.channelId}`,
          args.reply.messageId
        );
        // const message = messageSnapshot.data();
        // messageId not exist
        if (!messageSnapshot.data()) {
          reject({ code: 400, error: 'message/file not exist' });
          return;
        }
        const reply = messageModule.repackageMessageData(
          messageSnapshot.data()
        );
        insertData.reply = reply;
        // console.log(replyMessage);
      }
      insertData.channelId = args.message.channelId;
      insertData.message = args.message.message;
      insertData.type = args.message.type;
      insertData.hash = args.message.hash;
      insertData.createTime = modules.firebaseAdmin.firestore.Timestamp.now();
      insertData.messageId = messageId;
      insertData.softDelete = 2; // 2 is default and normal
      insertData.user = user;
      // insertData.reply = reply;

      console.log(insertData);

      // let ad = await messageDoc.set(insertData);
      // console.log(ad);

      resolve(insertData);
    } catch (err) {
      console.log('錯誤發生', err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createMessage;
