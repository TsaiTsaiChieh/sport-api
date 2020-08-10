const ajv = require('../../util/ajvUtil');
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
 * @api {post} /user/accuse Accuse user
 * @apiVersion 1.0.0
 * @apiName accuseUser
 * @apiGroup User
 * @apiPermission login user
 *
 * @apiParam (Request body) {String} defendant UID of user who is accused of having done something illegal
 * @apiParam (Request body) {String} reason reason options : [打廣告，內容不實，灌水洗版，人身攻擊，其它]
 * @apiParam (Request body) {String} evidence image URL
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
async function accuseUser(req, res) {
  try {
    const args = {};
    args.defendant = req.body.defendant;
    args.reason = req.body.reason;
    args.evidence = req.body.evidence;
    const schema = {
      type: 'object',
      required: ['defendant', 'reason', 'evidence'],
      properties: {
        defendant: { type: 'string', minLength: 28, maxLength: 33 },
        reason: { type: 'string', minLength: 2, maxLength: 50 },
        evidence: { type: 'string', format: 'url' }
      }
    };
    const valid = ajv.validate(schema, args);
    if (!valid) return res.status(400).json(ajv.errors);
    // if (!req.body.defendant || req.body.reason || req.body.evidence) return res.status(400).send();
    // const accuserSnapshot = await getSnapshot('users', req.token.uid);
    const mysql_user = await getUserInfo(args.defendant);
    if (!mysql_user) return res.status(400).json('user not dound');
    const accuser = mysql_user; // await accuserSnapshot.data();
    console.log(accuser);
    if (accuser.status < 1) return res.status(400).send();
    if (accuser.uid === req.token.uid) return res.status(400).send();
    // const accuseCredit = accuser.accuse_credit ? accuser.accuse_credit : 0;
    // const nowTimeStamp = admin.firestore.Timestamp.now();
    // const event = {};
    // event[accuser.uid] = {
    //   accuser: accuser.uid,
    //   createTime: nowTimeStamp,
    //   credit: accuseCredit,
    //   evidence: args.evidence,
    //   reason: args.reason,
    //   status: 0
    // };
    // firestore.collection('accuse_users').doc(args.defendant).set(event, { merge: true }).then(ref => {
    //   console.log('Added document with ID: ', ref);
    //   return res.status(200).json({ success: true, result: ref });
    // }).catch(e => {
    //   console.log('Added document with error: ', e);
    //   return res.status(500).json({ success: false, message: 'update failed' });
    // });
    const insertData = {
      uid: req.token.uid,
      type: 'user',
      article_id: accuser.uid,
      content: JSON.stringify({ reason: args.reason, image: args.evidence })
    };

    await dbCreate(insertData);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false });
  }
}

module.exports = accuseUser;
