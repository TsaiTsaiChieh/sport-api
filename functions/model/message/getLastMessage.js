/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModule = require('../../util/messageModule');

// like messages/last
function getLastMessage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // console.log(args.limit, args.offset);
      const messageCollection = await modules.firestore
        .collection('messages')
        .where('channelId', '==', args.channelId)
        .orderBy('createTime', 'desc')
        .limit(args.limit)
        .offset(args.offset)
        .get();
      const messages = [];

      messageCollection.forEach(async function(doc) {
        const data = doc.data();
        const messageSnapshot = await modules.getSnapshot(
          'messages',
          data.messageId
        );
        const message = messageSnapshot.data();
        const userSnapshot = await modules.getSnapshot('users', message.uid);
        const user = userSnapshot.data();
        const body = await messageModule.repackageMessageData(message, user, 1);
        messages.push(body);
        await Promise.all(messages);

        if (messages.length === args.limit) {
          if (args.token)
            resolve(
              messageModule.orderByCreateTime(
                await messageModule.maskMessages(messages, args.token)
              )
            );
          else resolve(messageModule.orderByCreateTime(messages));
        }
      });
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = getLastMessage;
