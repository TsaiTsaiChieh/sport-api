const modules = require('./modules');
const db = require('../util/dbUtil');
const firebaseAdmin = modules.firebaseAdmin;

exports.getFirebaseUser = async function(accessToken) {
  // const firebaseUid = `line:${body.id}`;
  // const firebaseUid = accessToken.sub.toString();
  const email = accessToken.email.toString();
  try {
    // const userRecord = await firebaseAdmin.auth().getUser(firebaseUid);
    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
    console.error(JSON.stringify(userRecord));
    return userRecord;
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      const userJson = {
        identifier: 'Line',
        uid: accessToken.sub.toString(),
        displayName: accessToken.name,
        photoURL: accessToken.picture,
        email: email
      };
      return await firebaseAdmin.auth().createUser(userJson);
    } else {
      console.error('firebaseUser error code ' + e.code);
      return null;
    }
  }
};

// async function getUserProfile(req, res) {
//     let sessionCookie = req.cookies.__session;
//     console.log("test...");
//     console.log(sessionCookie);
//     if (!sessionCookie) return res.status(401).send("missing token");
//     firebaseAdmin.auth().verifySessionCookie(
//         sessionCookie, true)
//         .then((decodedClaims) => {
//             console.log('getUserProfile - verifySessionCookie success : ', decodedClaims);
//             let uid = decodedClaims.uid;
//             userUtils.getUserProfile(uid).then(async firestoreUser => {
//                 res.setHeader('Access-Control-Allow-Origin', '*');
//                 return res.status(200).json(firestoreUser)
//             }).catch(error => {
//                 console.log('getUserProfile - getUserProfile false : ', error);
//                 return res.status(500).send("error");
//             });
//         })
//         .catch(error => {
//             console.log('getUserProfile - verifySessionCookie false : ', error);
//             return res.status(401).send("verify failed");
//         });
// }

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
      console.log('document found!', userRecord.createTime);
      returnJson.data = userRecord;
      returnJson.status = returnJson.data.status;
      returnJson.success = true;
    }
    console.log('getFirestoreUser : ', userIdStr, '\n', (JSON.stringify(returnJson, null, '\t')));
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
