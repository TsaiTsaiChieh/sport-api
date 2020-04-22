const modules = require('./modules');
const firebaseAdmin = modules.firebaseAdmin;

exports.getFirebaseUser = function (accessToken) {
  // const firebaseUid = `line:${body.id}`;
  const firebaseUid = accessToken.id_token.sub.toString();

  return firebaseAdmin.auth().getUser(firebaseUid).then(function (userRecord) {
    return userRecord;
  }).catch((error) => {
    const userJson = {
      identifier: 'Line',
      uid: firebaseUid,
      displayName: accessToken.id_token.name,
      photoURL: accessToken.id_token.picture,
      email: accessToken.id_token.email
    };
    if (error.code === 'auth/user-not-found') {
      return firebaseAdmin.auth().createUser(userJson);
    }
    return Promise.reject(error);
  });
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

exports.getUserProfile = async function (userId) {
  const returnJson = {
    success: false,
    uid: userId
  };
    // let userIdStr = userId.toString().trim();
  const userIdStr = userId;
  if (userIdStr.length < 1) {
    console.warn('firebaseGetUserData no userId : ', userId);
    return returnJson;
  }

  await modules.firestore.collection('users').doc(userIdStr).get().then(userRecord => {
    if (!userRecord.exists) {
      console.log('No such document!');
      returnJson.status = 0;
      returnJson.success = true;
    } else {
      console.log('document found!', userRecord.createTime);
      returnJson.data = userRecord.data();
      returnJson.status = returnJson.data.status;
      returnJson.success = true;
      // console.log(`Retrieved data: ${JSON.stringify(userRecord)}`);
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
exports.checkUniqueCollection = async function (collection, uid) {
  const returnJson = {
    success: false,
    isExist: true
  };
  try {
    const nameCollection = await modules.firestore.collection(collection).doc(uid).get();
    if (nameCollection.exists) {
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
