const firebaseAdmin = require('../../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const database = firebaseAdmin().database();
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const { getLastPeriod } = require('../../util/modules');
const { findUser } = require('../../util/databaseEngine');
const { leagueDecoder, league2Sport, USER_STATUS } = require('../../util/leagueUtil');
const MESSAGE_STATUS = {
  RETRACT: 0, // 使用者自行刪除，所以全部人皆看不到
  DELETE: 1, // 使用者不想看到自己或別人的訊息，只有該使用者看不到，其他人看得到
  DEFAULT: 2 // 訊息初始狀態
};

function createMessage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      args.createTime = firebaseAdmin().firestore.Timestamp.now();
      let defaultTitle = null;
      // Check if user exists and get default title
      const userData = await findUser(args.token.uid);
      // If user status is 1 (normal user), do not get the default title
      if (userData.status === USER_STATUS.GOD) {
        const { period } = getLastPeriod(args.now);
        defaultTitle = await getUserDefaultTitle(args.token.uid, period);
      }
      // Check user block message time
      await checkUserMuted(userData, args.now);
      // Get reply message info
      args.replyMessageObj = await replyMessage(args);
      // add message data to firestore & realtime and response
      return resolve(await insert2Firebase(args, { userData, defaultTitle }));
    } catch (err) {
      // status 1213 is for userMuted error returning
      return err.status === 1213 ? reject(err) : reject(new AppErrors.CreateMessageError(err));
    }
  });
}

function getUserDefaultTitle(uid, period) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT title.league_id, title.rank_id
           FROM users AS user
      INNER JOIN titles AS title 
             ON user.default_god_league_rank = title.league_id
            AND user.uid = title.uid
          WHERE user.uid = :uid
            AND title.period = :period`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { uid, period }
        });
      // If null, the result[0] is undefined
      return resolve(result[0]);
    } catch (err) {
      return reject(new AppErrors.MysqlError(err.stack));
    }
  });
};

function checkUserMuted(userData, now) {
  return new Promise(async function(resolve, reject) {
    try {
      const { block_message } = userData;
      if (userData.status < 1) {
        return reject(new AppErrors.UserHadBeenFreezed());
      }
      if (block_message) {
        const blockTime = new Date(block_message).getTime();
        if (now <= blockTime) {
          return reject(new AppErrors.UserHadBeenMuted(blockTime));
        }
      }
      return resolve();
    } catch (err) {
      return resolve(err.stack);
    }
  });
}

function replyMessage(args) {
  return new Promise(async function(resolve, reject) {
    try {
      if (args.reply) {
        const messageSnapshot = await firestore.collection(`chat_${args.message.channelId}`).doc(args.reply.messageId).get();
        const messageData = messageSnapshot.data();
        // message object did not exist return error
        // second condition is soft delete logic: if -1 (admin delete) or 0 (user retract) return error
        if (!messageData || messageData.message.softDelete <= MESSAGE_STATUS.RETRACT) return reject(new AppErrors.MessageNotFound());

        // deny user reply the message which deleted by user himself/herself
        if (args.token.uid === messageData.user.uid && messageData.message.softDelete === MESSAGE_STATUS.DELETE) return reject(new AppErrors.MessageNotFound());
        const reply = repackageReplyMessageData(messageData);
        return resolve(reply);
      } else return resolve();
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(err.stack));
    }
  });
}

function repackageReplyMessageData(messageData) {
  return new Promise(async function(resolve, reject) {
    try {
      const { message } = messageData;
      const data = {
        channelId: message.channelId,
        message: message.message,
        type: message.type,
        messageId: message.messageId,
        user: messageData.user
      };
      if (message.thumbURL) data.thumbURL = message.thumbURL;
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.RepackageError(err.stack));
    }
  });
}

function insert2Firebase(args, user) {
  return new Promise(async function(resolve, reject) {
    try {
      const messageDoc = firestore
        .collection(`chat_${args.message.channelId}`)
        .doc();
      const messageId = messageDoc.id;
      const data = await repackageMessageObject(args, messageId, user);

      const result = await messageDoc.set(data);
      if (result) {
        await database.ref(`chat_${args.message.channelId}`).child(messageId).set(data);
        return resolve(data);
      } else return reject(new AppErrors.FirebaseCollectError());
    } catch (err) {
      return reject(new AppErrors.FirebaseCollectError(err.stack));
    }
  });
}

function repackageMessageObject(args, messageId, user) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = {
        message: {
          channelId: args.message.channelId,
          message: args.message.message,
          type: args.message.type,
          messageId: messageId,
          softDelete: MESSAGE_STATUS.DEFAULT
        },
        user: {
          uid: user.userData.uid,
          displayName: user.userData.display_name,
          avatar: user.userData.avatar,
          status: user.userData.status,
          defaultTitle: null
        },
        createTime: args.createTime
      };
      if (user.defaultTitle) {
        const league = leagueDecoder(user.defaultTitle.league_id);
        const sport = league2Sport(league).sport_id;
        data.user.defaultTitle = {
          rank: user.defaultTitle.rank_id, league, sport
        };
      }
      if (args.message.thumbURL) data.message.thumbURL = args.message.thumbURL;
      if (args.replyMessageObj) data.reply = args.replyMessageObj;
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.RepackageError(err.stack));
    }
  });
}

module.exports = createMessage;