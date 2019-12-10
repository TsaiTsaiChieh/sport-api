const modules = require('../util/modules');
const folder = 'share_files';
async function repackageMessageData(message, user, replyFlag) {
  const body = {};
  // get messages
  body.message = {
    channelId: message.channelId,
    messageId: message.messageId,
    // replyMessageId: message.replyMessageId,
    message: message.message,
    softDelete:
      message.softDelete || message.softDelete === 0 ? Number.parseInt(message.softDelete) : 2, // 之後 create Message softDelete=2
    tempHash: message.tempHash,
    createTime: {
      seconds: message.createTime._seconds,
      nanoseconds: message.createTime._nanoseconds
    }
  };
  if (message.replyMessageId) {
    const replyMessageSnapshot = await modules.getSnapshot(
      'messages',
      message.replyMessageId
    );
    const replyMessage = replyMessageSnapshot.data();
    const replyUserSnapshot = await modules.getSnapshot(
      'users',
      message.replyUid
    );
    const replyUser = replyUserSnapshot.data();
    if (replyFlag === 1)
      body.reply = await repackageMessageData(replyMessage, replyUser, 0);
  }

  // get file
  if (message.fileUploadId) {
    // get storage
    try {
      const file = modules.bucket.file(`${folder}/${message.fileUploadId}.${message.fileSubname}`);
      const getFile = await file.get();
      let contentType = getFile[0].metadata.contentType;
      body.file = {
        id: message.fileUploadId,
        name: message.fileName,
        size: getFile[0].metadata.size,
        fileSubname:  contentType.substr(contentType.indexOf('/')+1)
      }
    } catch (err) {
      console.log(err);
      body.file = {};
      // Although the error occurs here, the program will continue to run unless return
    }
    
  }
  // get user
  // should be handle user not found error
  body.user = {
    uid: user.uid,
    displayName: user.displayName,
    avatar: user.avatar,
    signature: user.signature,
    status: Number.parseInt(user.status),
    title: user.title,
    point: user.point
  };
  if (user.titles) {
    body.user.titles = user.titles;
    if (user.defaultTitle) {
      body.user.defaultTitle = user.defaultTitle;
    }
  }
  return body;
}

function orderByCreateTime(messages) {
  return messages.sort((ele1, ele2) => {
    return ele1.message.createTime.seconds < ele2.message.createTime.seconds
      ? 1
      : -1;
  });
}

async function maskMessages(messages, token) {
  // get user uid from token info
  const userSnapshot = await modules.getSnapshot('users', token.uid);
  const user = userSnapshot.data();

  messages.forEach(ele => {
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
module.exports = { repackageMessageData, orderByCreateTime, maskMessages };
