const modules = require('../../util/modules');
const firebaseAdmin = require('../../util/firebaseUtil');
const db = require('../../util/dbUtil');
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
          'default_title'
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
function dbCreate(insertData) {
  return new Promise(async function(resolve, reject) {
    try {
      // await db.sequelize.models.service__reporttopic.sync({ alter: true }); //有新增欄位時才用
      await db.sequelize.models.service__reporttopic.create(insertData);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @api {post} /messages/accuse Accuse message
 * @apiVersion 1.0.0
 * @apiName accuseMessage
 * @apiGroup Messages
 * @apiPermission login user
 *
 * @apiParam (Request body) {String} channelId channel ID
 * @apiParam (Request body) {String} messageId ID which is accused of having comment something illegal
 *
 * @apiSuccess {JSON} result api result
 *
 * @apiSuccessExample success:
 *  HTTP/1.1 200 OK
 {
    "success": true,
    "result": {
        "_writeTime": {
            "_seconds": 1576823386,
            "_nanoseconds": 512028000
        }
    }
}
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 */
async function accuseMessage(req, res) {
  try {
    const args = {};
    args.messageId = req.body.messageId;
    args.channelId = req.body.channelId;
    const schema = {
      type: 'object',
      required: ['messageId', 'channelId'],
      properties: {
        messageId: { type: 'string', minLength: 20, maxLength: 20 },
        channelId: { type: 'string' }
      }
    };
    const valid = modules.ajv.validate(schema, args);
    if (!valid) return res.status(400).json(modules.ajv.errors);
    // const accuserSnapshot = await getSnapshot('users', req.token.uid);
    // if (!accuserSnapshot.exists) return res.status(400).send();
    // const accuser = await accuserSnapshot.data();
    // if (accuser.status < 1) return res.status(400).send();
    // if (accuser.uid === message.user.uid) return res.status(400).send();
    const mysql_user = await getUserInfo(req.token.uid);
    if (!mysql_user) return res.status(400).send();
    const accuser = mysql_user; // await accuserSnapshot.data();
    if (accuser.status < 1) return res.status(400).send();
    const firestore = firebaseAdmin().firestore();
    const messageSnapshot = await firestore.collection(`chat_${args.channelId}`).doc(args.messageId).get();
    if (!messageSnapshot.exists) return res.status(400).send();
    const message = await messageSnapshot.data();
    if (accuser.uid === message.user.uid) return res.status(400).send();

    const insertData = {
      uid: req.token.uid,
      type: 'message',
      article_id: args.channelId,
      content: JSON.stringify(message)
    };
    await dbCreate(insertData);
    return res.status(200).json({ success: true });

    // const accuseCredit = accuser.accuse_credit ? accuser.accuse_credit : 0;
    // const nowTimeStamp = admin.firestore.Timestamp.now();
    // const event = { message: message.message.message, updateTime: nowTimeStamp };
    // event[accuser.uid] = {
    //   accuser: accuser.uid,
    //   createTime: nowTimeStamp,
    //   credit: accuseCredit,
    //   defendant: message.user.uid,
    //   status: 0
    // };
    // firestore.collection('accuse_messages').doc(message.message.messageId).set(event, { merge: true }).then(ref => {
    //   console.log('Added document with ID: ', ref);
    //   return res.status(200).json({ success: true, result: ref });
    // }).catch(e => {
    //   console.log('Added document with error: ', e);
    //   return res.status(500).json({ success: false, message: 'update failed' });
    // });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false });
  }
}

module.exports = accuseMessage;
