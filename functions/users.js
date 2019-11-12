/* eslint-disable no-unreachable */
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
//const admin = require( 'firebase-admin' );
//const functions = require( 'firebase-functions' );
const envValues = require( '././env_values' );
const ShortcutFunction = require( './shortcut_function' );
//const ShortcutHash = require( './shortcut_hash' );
const htmlencode = require( 'js-htmlencode' );
const QRCode = require( 'qrcode' );

let a = "";


exports.stringToQRcodeUri = async function ( string = '' ) {
	//用字串產生QR CODE圖片
	let uri = '';
	try {
		uri = await QRCode.toDataURL( string );
		//uri
	} catch ( err ) {
		console.warn( 'stringToQRcodeUri error', err );
	}

	return uri;
};

exports.usersMergeData = async function ( dataJson ) {
	//用合併的方式存入資料庫
	let returnJson = {
		success: false
	};

	try {

		if ( !ShortcutFunction.haveEntityValue( dataJson.uid ) ) {
			returnJson.error = 'usersMergeData uid不存在,無法存入,需要重新登入';
			return returnJson;
		}

		let uid = ShortcutFunction.trim( dataJson.uid );

		if ( uid.length < 1 ) {
			returnJson.error = 'usersMergeData uid空字串,無法存入,需要重新登入';
			return returnJson;
		}

		let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();

		//let OlduserData = await this.usersGetData(userData.uid);
		let docRef = firestore.collection( 'users' ).doc( dataJson.uid );

		let writeResult = await docRef.set( dataJson, {
			merge: true
		} );

		returnJson.writeResult = writeResult;
		returnJson.success = true;

		//console.info( 'usersMergeData info :', returnJson );
	} catch ( error ) {
		console.warn( 'usersMergeData error', error );
		returnJson.error = error;
		console.info( 'dataJson : ', dataJson );
	}

	return returnJson;
};

exports.usersGetData = async function ( uid = '', userEmail = '' ) {
	let returnJson = {
		success: false,
		//uid: uid
	};
	try {
		if ( !ShortcutFunction.haveEntityValue( uid ) ) {
			returnJson.error = 'usersGetData uid 不存在,需要重新登入';
			console.warn( returnJson.error );
			return returnJson;
		}

		uid = ShortcutFunction.trim( uid );

		if ( uid.length < 1 ) {
			returnJson.error = 'usersGetData uid 空字串,需要重新登入';
			console.warn( returnJson.error );
			return returnJson;
		}

		let firestore = ShortcutFunction.lazyFirebaseAdmin().firestore();

		let docRef = await firestore
			.collection( 'users' )
			.doc( uid )
			.get();

		if ( docRef.exists ) {
			let userData1 = docRef.data();
			userData1.success = true;
			return userData1;
			//returnJson.userData = docRef.data();
			//returnJson.success = true;
			//return returnJson;
		}

		//users沒有這個用戶資料,開始填充
		//let timestamp1 = ShortcutFunction.timestampUTCmsInt();
		let mergeData = {
			uid: uid,
			email: userEmail,
			displayName: htmlencode.htmlEncode( 'new_'.concat( uid ) ),
			headPictureUri: await this.stringToQRcodeUri( 'new_'.concat( uid ) ),
			appearTimestamp: ShortcutFunction.timestampUTCmsInt()
		};

		let mergeReturnJson = await this.usersMergeData( mergeData );

		if ( !mergeReturnJson.success ) {
			return mergeReturnJson;
		}

		mergeData.success = true;
		return mergeData;

		//returnJson.userData = mergeData;
		//returnJson.success = true;
		//return returnJson;
	} catch ( error ) {
		console.warn( 'usersGetData error', error );
		returnJson.error = error;
	}

	return returnJson;
};


exports.authVerfyGetUserData = async function ( req ) {
	//從auth區取得用戶資料
	//console.info('run authVerfyGetUserData :');


	let returnJson = {
		success: false
	};

	try {
		//造假用戶資料===========================================================
		// return await this.usersGetData( 'bnKcVVaiIaUf3daVMNTTK5gH4hf1' );


		//==================================================================================
		let firebaseSession = ShortcutFunction.cookieGet__session( req );
		console.info( 'firebaseSession', firebaseSession );

		let firebaseAdmin = ShortcutFunction.lazyFirebaseAdmin( envValues.cert ); //
		//ShortcutFunction.firebaseGetAdmin(envValues.cert);
		//console.info('firebaseAdmin', firebaseAdmin);
		let DecodedIdToken1 = await firebaseAdmin.auth().verifySessionCookie( firebaseSession, true );
		console.log(DecodedIdToken1);

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

		if ( !ShortcutFunction.haveEntityValue( DecodedIdToken1.uid ) ) {
			returnJson.error = 'DecodedIdToken1.uid 不存在,需要重新登入';
			console.warn( returnJson.error );
			return returnJson;
		}

		let uid = ShortcutFunction.trim( DecodedIdToken1.uid );

		if ( uid.length < 1 ) {
			returnJson.error = 'DecodedIdToken1.uid 空字串,需要重新登入';
			console.warn( returnJson.error );
			return returnJson;
		}

		//用這個登入的uid去users取得用戶資料
		let userData = await this.usersGetData( DecodedIdToken1.uid, DecodedIdToken1.email );

		//console.info( 'authVerfyGetUserData userData', userData );

		return userData;
		//returnJson.block = null || false;

		//returnJson.success = true;
		//decodedClaims.block = false;
		//console.info(decodedClaims);

		//return decodedClaims;
	} catch ( error ) {
		console.warn( error );
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