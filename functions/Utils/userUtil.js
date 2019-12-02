const shortcutFunction = require('../shortcut_function');
const envValues = require('../Configs/env_values');
const admin = shortcutFunction.lazyFirebaseAdmin(envValues.cert);
const firestore = shortcutFunction.lazyFirebaseAdmin().firestore();

exports.getFirebaseUser = function (accessToken) {
    // const firebaseUid = `line:${body.id}`;
    const firebaseUid = accessToken.id_token.sub.toString();

    return admin.auth().getUser(firebaseUid).then(function (userRecord) {
        return userRecord;
    }).catch((error) => {
        let userJson = {
            identifier: "Line",
            uid: firebaseUid,
            displayName: accessToken.id_token.name,
            photoURL: accessToken.id_token.picture,
            email: accessToken.id_token.email
        };
        if (error.code === 'auth/user-not-found') {
            return admin.auth().createUser(userJson);
        }
        return Promise.reject(error);
    });
};

exports.getUserProfile = async function (userId) {
    let returnJson = {
        success: false,
        uid: userId
    };
    // let userIdStr = userId.toString().trim();
    let userIdStr = userId;
    if (userIdStr.length < 1) {
        console.warn('firebaseGetUserData no userId : ', userId);
        return returnJson;
    }

    await firestore.collection('users').doc(userIdStr).get().then(userRecord => {
        if (!userRecord.exists) {
            console.log('No such document!');
            returnJson.userStats = 0;
            returnJson.success = true;
        } else {
            console.log("document found!", userRecord.createTime);
            returnJson.data = userRecord.data();
            returnJson.userStats = returnJson.data.userStats;
            returnJson.success = true;
            // console.log(`Retrieved data: ${JSON.stringify(userRecord)}`);
        }
        console.log('getFirestoreUser : ', userIdStr, '\n', (JSON.stringify(returnJson, null, '\t')));
    }).catch(err => {
        console.warn('firebaseGetUserData', err);
        returnJson.success = false;
    });
    console.log('No such document! 2');
    return returnJson;
};