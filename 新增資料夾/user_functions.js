/* eslint-disable no-unreachable */
/* eslint-disable no-fallthrough */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const admin = require( 'firebase-admin' );
const functions = require( 'firebase-functions' );
const envValues = require( '././env_values' );
const longsingShortcutFunction = require( './shortcut_function' );
const longsingShortcutHash = require( './shortcut_hash' );
const htmlencode = require( 'js-htmlencode' );
const QRCode = require( 'qrcode' );
const firebaseFunctions = require( 'firebase-functions' );
const users = require( './users' );
const cookie = require( 'cookie' );
const express = require( 'express' );


exports.stringToQRcodeUri = async function ( string = '' ) {
	let uri = '';
	try {
		uri = await QRCode.toDataURL( string );
		//uri
	} catch ( err ) {
		console.warn( 'stringToQRcodeUri error', err );
	}

	return uri;
};

exports.firebaseGetUserData = async function ( userId = '', userEmail = '' ) {
	let returnJson = {
		success: false,
		uid: userId
	};
	try {
		let userIdStr = userId.toString().trim();

		if ( userIdStr.length < 1 ) {
			console.warn( 'firebaseGetUserData no userId : ', userId );
			returnJson.stack = 'no userId';
			returnJson.userId = userId;

			return returnJson;
		}

		let firestore = longsingShortcutFunction.lazyFirebaseAdmin().firestore();

		let docRef = await firestore
			.collection( 'users' )
			.doc( userIdStr )
			.get();
		//docSnapshot.exists

		let data = {};

		let userExists = docRef.exists;

		if ( userExists ) {
			data = docRef.data();
		} else {
			returnJson.stack = 'user not Exists';
			//return returnJson;
		}

		let timestamp1 = longsingShortcutFunction.timestampUTCmsInt();

		let updateUserData = {
			uid: userIdStr
		};
		if ( !userExists ) {
			updateUserData.uid = userId;
			if ( userEmail.toString().length > 0 ) {
				updateUserData.email = userEmail;
			}
		}

		returnJson.displayName = data.displayName || '';
		if ( returnJson.displayName.length < 1 ) {
			returnJson.displayName = htmlencode.htmlEncode( 'naname_'.concat( longsingShortcutHash.sipHashToHex( userId, timestamp1 ) ) );
			updateUserData.displayName = returnJson.displayName;
		}

		//returnJson.uid = userId;
		//returnJson.displayName = data.displayName || ;
		returnJson.headPictureUri = data.headPictureUri || '';
		if ( returnJson.headPictureUri.length < 1 ) {
			returnJson.headPictureUri = await this.stringToQRcodeUri( returnJson.displayName );
			returnJson.fileType = 'image / png';

			updateUserData.headPictureUri = returnJson.headPictureUri;
			updateUserData.fileType = returnJson.fileType
		}
		//returnJson.color = data.color || '';

		if ( !userExists ) {
			let ref = this.UserDataToFirestore( updateUserData );

		}

		returnJson.success = true;
		//doc = this.setNoValue(docSnapshot.data(), {});
	} catch ( error ) {
		console.warn( 'firebaseGetUserData error', error );
		returnJson.stack = error;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()
	//console.info( 'firebaseGetUserData', returnJson );
	return returnJson;
};

exports.UserDataToFirestore = async function ( userData = {} ) {
	let returnJson = {
		success: false
	};

	try {
		let firestore = longsingShortcutFunction.lazyFirebaseAdmin().firestore();

		//let OlduserData = await this.firebaseGetUserData(userData.uid);
		let docRef = firestore.collection( 'users' ).doc( userData.uid );

		let writeResult = await docRef.set( userData, {
			merge: true
		} );


		returnJson.writeResult = writeResult;
		returnJson.success = true;

		console.info( 'UserDataToFirestore info :', returnJson );
	} catch ( error ) {
		console.warn( 'UserDataToFirestore error', error );
		returnJson.stack = error;
		console.info( 'userData : ', userData );
	}

	return returnJson;
};

exports.GetUserDataToArray = async function ( userId = '', userArray = [] ) {
	try {
		let userData = userArray[ userId ] || {};
		if ( userData.uid === undefined || userData.uid === null ) {
			userData = await this.firebaseGetUserData( userId );
			if ( userData.success ) {
				userArray[ userId ] = userData;
			}
		}
	} catch ( error ) {
		console.warn( 'GetUserDataToArray', error );
		//returnJson.stack = error.stacks;
	}

	return userArray;
};

exports.firebaseSessionGetLoginUser = async function ( req ) {
	//console.info('run firebaseSessionGetLoginUser :');

	let firebaseSession = longsingShortcutFunction.cookieGet__session( req );
	let returnJson = {
		success: false
		/*
		"iss": "https://session.firebase.google.com/sport19y0715",
		"aud": "sport19y0715",
		"auth_time": 1572592346,
		"user_id": "lwuk39zSACR2PXy3HxRbyZv0KKp2",
		"sub": "lwuk39zSACR2PXy3HxRbyZv0KKp2",
		"iat": 1572592356,
		"exp": 1573197156,
		"email": "rex@gets-info.com",
		"email_verified": true,
		"firebase": {
			"identities": {
				"email": [
					"rex@gets-info.com"
				]
			},
			"sign_in_provider": "password"
		},
		"uid": "lwuk39zSACR2PXy3HxRbyZv0KKp2"
		*/
	};

	try {
		let firebaseAdmin = longsingShortcutFunction.lazyFirebaseAdmin( envValues.cert ); //cert是路徑
		//longsingShortcutFunction.firebaseGetAdmin(envValues.cert);
		//console.info('firebaseAdmin', firebaseAdmin);
		let DecodedIdToken1 = await firebaseAdmin.auth().verifySessionCookie( firebaseSession, true );

		/*
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



		let userData = await this.firebaseGetUserData( DecodedIdToken1.uid, DecodedIdToken1.email );

		//console.info( 'firebaseSessionGetLoginUser userData', userData );

		returnJson.uid = DecodedIdToken1.uid || '';
		returnJson.block = null || false;

		returnJson.success = true;
		//decodedClaims.block = false;
		//console.info(decodedClaims);

		//return decodedClaims;
	} catch ( error ) {
		console.warn( error );
		returnJson.stack = error;
	}

	return returnJson;
};


/*
const app = express();
app.use( express.json() );

app.all( '*', async ( req, res ) => {
	//'*' ??? '/:a/:b/**' ?????req.params.???,??????,??????

	let returnJson = {
		success: false
	}; //????

	try {
		returnJson.method = req.method; //post,get;
		switch ( req.method ) {
			case 'GET':
				//break;
			case 'POST':
				break;

			default:
				//post,get???????403
				res.status( 403 ).send( '' );
				//res.end();
				return;
				break;
		} //sw

		let userData = await users.firebaseSessionGetLoginUser( req );
		returnJson.userData = userData;
		//userData.uid=''
		//userData.block=false

		console.info( 'req.params :', req.params ); // /:act1/:act2
		console.info( 'req.query :', req.query ); // all use
		//console.info( 'req.headers :', req.headers ); //no use

		let paramArray = req.params[ 0 ] //????,?????decodeURI(),????decodeURI()
			.split( '/' ) //??,?? '//' ???? '/' ?????
			.filter( param => param.length > 0 ); //??????
		//returnJson.paramArray = paramArray;

		let param1 = longsingShortcutFunction.unEntityValueToDef( paramArray[ 0 ], '' );
		let param2 = longsingShortcutFunction.unEntityValueToDef( paramArray[ 1 ], '' );

		switch ( param1.toLowerCase() ) {
			//????
			case '':
			case 'list':
				//????????

				break;

				//case 'create': //???????

			case 'report': //??
				break;

			case 'block': //????
				break;

			case '_schema': //?????????
				if ( envValues.release ) {
					//??????
					break;
				}

				default: {
					//??????
					if ( param2.length > 0 && param1 !== '_schema' ) {
						//???????????

						switch ( param2.toLowerCase() ) {
							case 'delete':
								break;

							case 'report':
								break;
						}
					}


				} //default

				break;
		} //sw

		//res.status(200).send('');//txt
		//res.status(200).json(returnJson);
		returnJson.success = true;
	} catch ( error ) {
		console.warn( error.stack );
		//res.status(200).send(error.stack); //txt
		returnJson.stack = error;
	}

	res.json( longsingShortcutFunction.clearJson( returnJson ) );

} );


module.exports = firebaseFunctions.https.onRequest( app );
*/