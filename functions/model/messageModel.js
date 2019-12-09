/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const modules = require('../util/modules');

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
        const body = await repackageMessageData(message, user);
        messages.push(body);
        await Promise.all(messages);
        if (messages.length === args.limit) {
          resolve(orderByCreateTime(await maskMessages(messages, args.token)));
        }
      });
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
    }
  });
}

// like messages/get
function getMessageWithId(id) {
  return new Promise(async function(resolve, reject) {
    try {
      const messageSnapshot = await modules.getSnapshot('messages', id);
      const message = messageSnapshot.data();
      let body = {};
      if (message) {
        const userSnapshot = await modules.getSnapshot('users', message.uid);
        const user = userSnapshot.data();
        if (user) {
          body = repackageMessageData(message, user);
        } else {
          reject({
            code: 400,
            error: 'This user did does not exist (輸入的使用者 uid 不存在)'
          });
        }
      } else {
        reject({
          code: 400,
          error: 'This message id does not exist (輸入的訊息 id 不存在)'
        });
      }
      resolve(body);
    } catch (err) {
      console.log(err);
      reject({ code: 500, error: err });
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
        reject({ code: 500, error: err });
      });
  });
}
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

async function repackageMessageData(message, user) {
  const body = {};
  // get messages
  body.message = {
    channelId: message.channelId,
    messageId: message.messageId,
    replyMessageId: message.replyMessageId,
    message: message.message,
    softDelete:
      message.softDelete || message.softDelete === 0 ? message.softDelete : 2, // 之後 create Message softDelete=2
    tempHash: message.tempHash,
    createTime: {
      seconds: message.createTime._seconds,
      nanoseconds: message.createTime._nanoseconds
    }
  };
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
  // get user
  // should be handle user not found error
  body.user = {
    uid: user.uid,
    displayName: user.displayName,
    avatar: user.avatar,
    title: user.title
  };
  return body;
}
function orderByCreateTime(messages) {
  return messages.sort(function(ele1, ele2) {
    return ele1.message.createTime.seconds < ele2.message.createTime.seconds
      ? 1
      : -1;
  });
}

async function maskMessages(messages, token) {
  // get user uid from token info
  const userSnapshot = await modules.getSnapshot('users', token.uid);
  const user = userSnapshot.data();

  messages.forEach(function(ele) {
    const softDelete = Number.parseInt(ele.message.softDelete);
    if (softDelete === -1) {
      ele.message.message = '訊息已被管理員刪除';
    } else if (softDelete === 0) {
      ele.message.message = '訊息已被刪除';
    } else if (ele.user.uid === user.uid) {
      if (softDelete === 1) {
        ele.message.message = '訊息已被隱藏';
      }
    }
  });
  return messages;
}
module.exports = {
  getMessageWithId,
  postMessage,
  deleteMessageWithId,
  getLastMessage
};
