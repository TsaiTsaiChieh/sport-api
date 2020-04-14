const modules = require('../../util/modules');
async function createTopic(token, body) {
  return new Promise(async function(resolve, reject) {
    try {
      const insertData = {};
      // insertData.createTime = modules.firebaseAdmin.firestore.Timestamp.now();

      const userSnapshot = await modules.getSnapshot('users', token.uid);

      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }


      insertData.message = {
        channelId: args.message.channelId,
        message: args.message.message,
        type: args.message.type,
        tempHash: args.message.tempHash,
        messageId: messageId,
        softDelete: 2 /* 2 is default and normal */
      };
      
      




      resolve(insertData);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
module.exports = createTopic;