const db = require('../util/dbUtil');
const firebaseAdmin = require('../util/firebaseUtil');
const logger = require('firebase-functions/lib/logger');

// https://developers.line.biz/zh-hant/docs/line-login/integrate-line-login/#verify-id-token
exports.getFirebaseUser = async function(accessToken) {
  const sub = accessToken.sub.toString();
  // const email = accessToken.email.toString();
  logger.warn(JSON.stringify(accessToken));
  try {
    const userRecord = accessToken.email
      ? await firebaseAdmin().auth().getUserByEmail(accessToken.email)
      : await firebaseAdmin().auth().getUser(sub);
    logger.warn(JSON.stringify(userRecord));
    return userRecord;
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      const userJson = {
        identifier: 'Line',
        uid: sub,
        displayName: accessToken.name,
        photoURL: accessToken.picture,
        email: accessToken.email
      };
      return await firebaseAdmin().auth().createUser(userJson);
    } else {
      logger.error('firebaseUser error code ' + e.code);
      return null;
    }
  }
};

exports.getUserProfile = async function(userId) {
  const returnJson = {
    success: false,
    uid: userId
  };
    // let userIdStr = userId.toString().trim();
  const userIdStr = userId;
  if (userIdStr.length < 1) {
    console.warn('MySQLGetUserData no userId : ', userId);
    return returnJson;
  }

  await db.User.findAll({
    where: {
      uid: userIdStr
    }
  }).then(userRecord => {
    if (userRecord.length <= 0) {
      console.log('No such document!');
      returnJson.status = 0;
      returnJson.success = true;
    } else {
      // console.log('document found!', userRecord.createTime);
      returnJson.data = userRecord;
      returnJson.status = returnJson.data.status;
      returnJson.success = true;
    }
    // console.log('getFirestoreUser : ', userIdStr, '\n', (JSON.stringify(returnJson, null, '\t')));
    return returnJson;
  }).catch(err => {
    console.warn('firebaseGetUserData', err);
    returnJson.success = false;
  });
  console.log('No such document! 2');
  return returnJson;
};

// Unique collections: uniqueName,uniqueEmail,uniquePhone
exports.checkUniqueCollection = async function(collection, value) {
  const returnJson = {
    success: false,
    isExist: true
  };

  try {
    const corr = [];
    corr.uniqueName = 'display_name';
    corr.uniqueEmail = 'email';
    corr.uniquePhone = 'phone';

    const collect = corr[collection];
    const nameCollection = await db.sequelize.query(
      `
        SELECT * FROM users WHERE ${collect} = '${value}'
       `,
      {
        plain: true,
        logging: true,
        type: db.sequelize.QueryTypes.SELECT
      });
    console.log(nameCollection);
    if (nameCollection != null) {
      returnJson.success = true;
      returnJson.isExist = true;
    } else {
      returnJson.success = true;
      returnJson.isExist = false;
    }
  } catch (e) {
    console.log(e);
  }
  return returnJson;
};
