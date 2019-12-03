/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../util/modules');

// like messages/get
function getMessageWithId(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const body = {};
      const messageSnapshot = await modules.getSnapshot('messages', id);
      const message = messageSnapshot.data();
      const userSnapshot = await modules.getSnapshot('users', message.uid);
      const user = userSnapshot.data();
      // get file
      if (message.fileUploadId) {
        const fileSnapshot = await modules.getSnapshot(
          'uploadFiles',
          message.fileUploadId
        );
        const file = fileSnapshot.data();
        body.file = {
          id: message.fileUploadId,
          name: message.fileName,
          size: file.fileSize,
          type: file.fileSubName,
          farmHash: file.fileFarmHash,
          sipHash: file.fileSipHash
        };
      }
      // get messages
      body.message = {
        channelId: message.channelId,
        messageId: message.messageId,
        replyMessageId: message.replyMessageId,
        message: message.message,
        tempHash: message.tempHash,
        createTime: {
          seconds: message.createTime._seconds,
          nanoseconds: message.createTime._nanoseconds
        }
      };
      // get user
      body.user = {
        uid: user.uid,
        displayName: user.displayName,
        avatar: user.avatar,
        title: user.title
      };
      resolve(body);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

// like messages/create
function postMessage(req) {
  return new Promise(function(resolve, reject) {
    let { channel, message, replyMessageId } = req.body;
    modules.firestore
      .collection(collectionName)
      .add({ channelId, message, replyMessageId })
      .then(function(data) {
        const body = {};
        body.data = {};
        console.log('這', data._path.segments[1]);
        resolve(data);
      })
      .catch(function(err) {
        console.log(err);
        reject(err);
      });
  });
}
// like /message/delete
function deleteMessageWithId(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const messageSnapshot = await modules.getSnapshot('messages', id);
      const message = messageSnapshot.data();
      // console.log(message);
      // if message did not exist, it would return undefined
      if (!message) {
        reject({ code: 404, error: 'This message id does not exist' });
      }
      resolve(`Delete id:${id} in messages collection successful`);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}
module.exports = { getMessageWithId, postMessage, deleteMessageWithId };
