/* eslint-disable no-unreachable */
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const admin = require('firebase-admin');
//const functions = require( 'firebase-functions' );
const envValues = require('../config/env_values');
const ShortcutFunction = require('./shortcut_function');
//const ShortcutHash = require( './shortcut_hash' );
const fieldValue = admin.firestore.FieldValue;
const firebaseTime = admin.firestore.Timestamp;
const htmlencode = require('js-htmlencode');
const QRCode = require('qrcode');

let a = '';

exports.stringToQRcodeUri = async function(string = '') {
  //用字串產生QR CODE圖片
  let uri = '';
  try {
    uri = await QRCode.toDataURL(string);
    //uri
  } catch (err) {
    console.warn('stringToQRcodeUri error', err);
  }

  return uri;
};

exports.usersMergeData = async function(dataJson) {
  //用合併的方式存入資料庫
  let returnJson = {
    success: false, //,
    //history: []
    functionName: 'usersMergeData'
  };

  try {
    dataJson.uid = ShortcutFunction.trim(dataJson.uid);

    if (dataJson.uid.length < 1) {
      returnJson.error = 'usersMergeData uid不存在,無法存入,需要重新登入';
      return returnJson;
    }

    let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();

    //let OlduserData = await this.usersGetData(userData.uid);
    let docRef = firestore.collection('users').doc(dataJson.uid);

    let writeResult = await docRef.set(dataJson, {
      merge: true
    });

    returnJson.writeResult = writeResult;

    returnJson.success = true;
  } catch (error) {
    console.warn('usersMergeData error', error);
    returnJson.error = error;
    console.info('dataJson : ', dataJson);
  }

  let userData = await this.userIdToUserData(dataJson.uid);
  returnJson.success = true;
  userData.history = returnJson;

  return userData;
};

exports.userIdToUserData = async function(
  uid = '',
  isNewAppend = false,
  email = ''
) {
  let returnJson = {
    success: false, //,
    //history: []
    functionName: 'userIdToUserData'
  };
  try {
    returnJson.uid = ShortcutFunction.trim(uid); //uid.toString(); //

    if (returnJson.uid.length < 1) {
      returnJson.error = '沒有 uid ';
      console.warn(returnJson.error);
      return returnJson;
    }

    let FirebaseAdmin = ShortcutFunction.lazyFirebaseAdmin();

    let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();

    let docRef = await firestore
      .collection('users')
      .doc(returnJson.uid)
      .get();

    let userData1 = docRef.data();

    //returnJson.history.push( userData1 || 'userData1 undefined' );

    //let CustomToken = await FirebaseAdmin.auth().createCustomToken( uid ) || '';

    if (userData1 !== undefined) {
      userData1.uid = userData1.uid || '';
      userData1.email = userData1.email || '';
      userData1.displayName = userData1.displayName || '';
      userData1.createTime = userData1.createTime || '';
      userData1.avatar = userData1.avatar || '';
      userData1.name = userData1.name || '';

      userData1.userStats = userData1.userStats || 0;
      userData1.signature = userData1.signature || '';
      userData1.title = userData1.title || '';
      userData1.phone = userData1.phone || '';

      userData1.denys = userData1.denys || [];

      userData1.coin = userData1.coin || 0;
      userData1.dividend = userData1.dividend || 0;
      userData1.ingot = userData1.ingot || 0;
      userData1.point = userData1.point || 0;

      userData1.functionName = 'userIdToUserData';
      //userData1.CustomToken = CustomToken;
      userData1.success = true;

      userData1.blockMessage = ShortcutFunction.IntfromAny(
        userData1.blockMessage,
        -1
      );

      return userData1;

      //returnJson.userData = docRef.data();
      //returnJson.success = true;
      //return returnJson;
    }

    if (isNewAppend) {
      //users沒有這個用戶資料,開始填充
      let mergeData = {
        uid: uid || '',
        email: email || '',
        birthday: -1,
        name: '',
        phone: '',
        userStats: 0,
        signature: '',
        title: '',
        coin: 0,
        dividend: 0,
        ingot: 0,
        point: 0,
        blockMessage: -1,
        //denys:[],
        displayName: htmlencode.htmlEncode('new_'.concat(uid)),
        avatar: await this.stringToQRcodeUri('new_'.concat(uid)), //
        createTime: firebaseTime.now() // ShortcutFunction.timestampUTCmsInt()
      };

      let mergeReturn = await this.usersMergeData(mergeData); //
      returnJson.success = true;

      mergeReturn.history = returnJson;
      mergeReturn.success = true;
      return mergeReturn;
    }

    //returnJson.userData = userData1;
    returnJson.error = '用戶資料不存在';
  } catch (error) {
    console.warn('userIdToUserData error', error);
    returnJson.error = error;
  }

  return returnJson;
};

exports._authVerfyGetUserData = async function(inputJson = {}) {
  //從auth區取得用戶資料
  console.info('run authVerfyGetUserData :');

  let returnJson = {
    success: false, //,
    //	history: []
    functionName: 'authVerfyGetUserData'
  };

  try {
    //造假用戶資料===========================================================
    //

    returnJson.firebaseSession = inputJson.__session || ''; //ShortcutFunction.cookieGet__session( req ) || ''; //|| 'error'

    console.info(
      'authVerfyGetUserData cookieGet__session>>>>>>',
      returnJson.firebaseSession
    );

    let firebaseAdmin = ShortcutFunction.lazyFirebaseAdmin(envValues.cert); //

    try {
      returnJson.DecodedIdToken1 = await firebaseAdmin
        .auth()
        .verifySessionCookie(returnJson.firebaseSession, true);
    } catch (error2) {
      returnJson.error2 = error2;

      //造假
      returnJson.userData = await this.usersGetData(
        returnJson.DecodedIdToken1.uid,
        returnJson.DecodedIdToken1.email
      );
      returnJson.success = true;
      return returnJson;
      //造假
    }

    if (returnJson.DecodedIdToken1 === undefined) {
      //造假
      returnJson.userData = await this.usersGetData(
        returnJson.DecodedIdToken1.uid,
        returnJson.DecodedIdToken1.email
      );
      returnJson.success = true;
      return returnJson; //造假

      returnJson.error = 'DecodedIdToken1 不存在,需要重新登入';
      console.warn('authVerfyGetUserData  returnJson', returnJson);
      return returnJson;
    }

    //returnJson.history.push( returnJson.DecodedIdToken1 );

    console.info(
      'authVerfyGetUserData   DecodedIdToken1 >>>>>>>>>>>>>>>>>',
      returnJson
    );

    /* 取得的資料結構
        DecodedIdToken1 => {
        "iss": "https://session.firebase.google.com/sport19y0715",
        "aud": "sport19y0715",
        "auth_time": 1572592691,
        "user_id": "bnKcVVaiIaUf3daVMNTTK5gH4hf1",
        "sub": "bnKcVVaiIaUf3daVMNTTK5gH4hf1",
        "iat": 1572592695,
        "exp": 1573197495,
        "email": "ina2588@gets-info.com",
        "email_verified": false,
        "firebase": {
            "identities": {
                "email": [
                    "ina2588@gets-info.com"
                ]
            },
            "sign_in_provider": "password"
        },
        "uid": "bnKcVVaiIaUf3daVMNTTK5gH4hf1"
        }
        */

    //stringToQRcodeUri(uid)

    if (!ShortcutFunction.haveEntityValue(returnJson.DecodedIdToken1.uid)) {
      //造假
      returnJson.userData = await this.usersGetData(
        returnJson.DecodedIdToken1.uid,
        returnJson.DecodedIdToken1.email
      );
      returnJson.success = true;
      return returnJson; //造假

      //return returnJson.DecodedIdToken1;
      returnJson.error = 'DecodedIdToken1.uid 不存在,需要重新登入';
      console.warn('authVerfyGetUserData  returnJson', returnJson);
      return returnJson;
    }

    let uid = returnJson.DecodedIdToken1.uid || '';
    uid = ShortcutFunction.trim(uid);

    if (uid.length < 1) {
      returnJson.error = 'DecodedIdToken1.uid 空字串,需要重新登入';
      console.warn('authVerfyGetUserData  returnJson', returnJson);
      return returnJson;
      //console.warn( returnJson.error );
      //return returnJson;
    }

    //用這個登入的uid去users取得用戶資料
    returnJson.userData = await this.usersGetData(
      returnJson.DecodedIdToken1.uid,
      returnJson.DecodedIdToken1.email
    );

    //console.info( 'authVerfyGetUserData userData', userData );

    //if ( userData.history ) {
    //	userData.history.push( returnJson.history );
    //	} else {
    //	userData.history = returnJson.history; //.push( returnJson.DecodedIdToken1 );
    //	}

    returnJson.success = true;

    return returnJson; //userData;
    //returnJson.block = null || false;

    //returnJson.success = true;
    //decodedClaims.block = false;
    //console.info(decodedClaims);

    //return decodedClaims;
  } catch (error) {
    console.warn(error);
    returnJson.error = error;
  }

  return returnJson;
};

/*
exports.getLoginUserData = async function ( req ) {
	let returnJson = {
		success: false
	};

	try {
		//

	} catch ( error ) {
		console.warn( 'messageReport error', error );
		returnJson.error = error;
	}

	return returnJson;
}*/

/*
exports.GetUserDataToArray = async function ( userId = '', userArray = [] ) {
	try {
		let userData = userArray[ userId ] || {};
		if ( userData.uid === undefined || userData.uid === null ) {
			userData = await this.usersGetData( userId );
			if ( userData.success ) {
				userArray[ userId ] = userData;
			}
		}
	} catch ( error ) {
		console.warn( 'GetUserDataToArray', error );
		//returnJson.error = error;
	}

	return userArray;
};
*/
