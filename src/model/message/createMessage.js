const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const database = firebaseAdmin().database();
const db = require('../../util/dbUtil');
const messageModule = require('../../util/messageModule');
async function getUserInfo(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user.findOne({
        attributes: [
          'uid',
          'status',
          'avatar',
          'display_name',
          'signature',
          'default_title',
          'block_message'
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
function createMessage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {};
      insertData.createTime = firebaseAdmin().firestore.Timestamp.now();

      /* get user according token */
      // user部分讀mysql 訊息仍然放在firebase rtdb
      const mysql_user = await getUserInfo(args.token.uid);
      /* step1: check if user exists */
      if (!mysql_user) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      /* step2: check user block message time */
      if (mysql_user.block_message && mysql_user.block_message !== null && mysql_user.block_message !== '') {
        const block_date = new Date(mysql_user.block_message);
        const block_ts = block_date.getTime();
        if (Date.now() < block_ts) {
          reject({ code: 403, error: 'user had been muted' });
          return;
        }
      }
      // if (userSnapshot.data().blockMessage._seconds * 1000 > new Date()) {
      //   reject({ code: 403, error: 'user had been muted' });
      //   return;
      // }
      /* step3: get reply message info (future can be written as function) */
      if (args.reply) {
        const messageSnapshot = await firestore.collection(`chat_${args.message.channelId}`).doc(args.reply.messageId).get();
        /* messageId did not exist return 400 error */
        /* second condition is soft delete logic: if -1 (admin delete) or 0 (user delete) return error */
        if (
          !messageSnapshot.data() ||
          messageSnapshot.data().message.softDelete <= 0
        ) {
          reject({ code: 404, error: 'message/file not found' });
          return;
        }
        /* deny user reply the message which deleted by user himself/herself */
        if (
          args.token.uid === messageSnapshot.data().user.uid &&
          messageSnapshot.data().message.softDelete === 1
        ) {
          reject({
            code: 403,
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
      const messageDoc = firestore
        .collection(`chat_${args.message.channelId}`)
        .doc();
      const messageId = messageDoc.id;
      // const user = messageModule.repackageUserData(userSnapshot.data()); //舊的
      const user = { // 建立要放在firebase rtdb的結構
        uid: mysql_user.uid,
        displayName: mysql_user.display_name,
        avatar: mysql_user.avatar,
        status: mysql_user.status,
        defaultTitle: {}
      };

      insertData.message = {
        channelId: args.message.channelId,
        message: args.message.message,
        type: args.message.type,
        tempHash: args.message.tempHash,
        messageId: messageId,
        softDelete: 2 /* 2 is default and normal */
      };
      if (args.message.thumbURL) {
        insertData.message.thumbURL = args.message.thumbURL;
      }
      insertData.user = user;
      /* add message data to firestore & realtime */
      const result = await messageDoc.set(insertData);
      if (result) {
        database
          .ref(`chat_${args.message.channelId}`)
          .child(messageId)
          .set(insertData);
        resolve(insertData);
      } else {
        reject({ code: 500, error: 'insert firestore failed' });
        return;
      }
    } catch (err) {
      console.error('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = createMessage;
