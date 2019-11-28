/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const admin = require('firebase-admin');
const db = admin.firestore();
const collectionName = 'messages';

function getMessageWithKey(key) {
  return new Promise(function(resolve, reject) {
    db.collection(collectionName)
      .doc(key)
      .get()
      .then(function(snapshot) {
        const data = snapshot.data();
        const body = {};
        body.data = {
          channelId: data.channelId,
          createTime: data.createTime,
          fileName: data.fileName,
          fileUploadId: data.fileUploadId,
          message: data.message,
          messageId: data.messageId,
          replyMessageId: data.replyMessageId,
          tempHash: data.tempHash,
          uid: data.uid
        };
        resolve(body);
      })
      .catch(function(err) {
        console.log(`getMessageWithKey error happened: ${err}`);
        reject(err);
      });
  });
}

function postMessage(req) {
  return new Promise(function(resolve, reject) {
    let { channelId, message, replyMessageId } = req.body;
    db.collection(collectionName)
      .add({ channelId, message, replyMessageId })
      .then(function(data) {
        console.log('這', data._path);
        resolve(data);
      })
      .catch(function(err) {
        console.log(err);
        reject(err);
      });
  });
}
function deleteMessage(key) {
  return new Promise(function(resolve, reject) {
    db.collection(collectionName)
      .doc(key)
      .delete()
      .then(function() {
        resolve(`Delete ${key} in messages collection successful.`);
      })
      .catch(function(err) {
        console.log(`deleteMessage error: ${err}`);
        reject(err);
      });
  });
}
module.exports = { getMessageWithKey, postMessage, deleteMessage };