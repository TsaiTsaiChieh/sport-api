/* eslint-disable no-unreachable */
/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

/*
範例,在exports的時候呼叫同檔案的函數,需加前綴this.
exports.ok=
function (inp){
return this.setNoValue(inp,'ok2');
}
*/

const admin = require( 'firebase-admin' );
const functions = require( 'firebase-functions' );
const fs = require( 'fs' );

const cookie = require( 'cookie' );
//const htmlencode = require('js-htmlencode');
const moment = require( 'moment' ); //https://www.npmjs.com/package/moment
const util = require( 'util' );

const envValues = require( '../env_values' );
const myHash = require( './shortcut_hash' );

//const { Storage } = require('@google-cloud/storage');

//const admin = require('firebase-admin');
//const functions = require('firebase-functions');

//admin.initializeApp(functions.config().firebase);

//const db = admin.firestore();

//用這個才不會把emoji編碼成亂碼
//const htmlencode = require('js-htmlencode');

exports.trim = function ( string = '' ) {
	return string.replace( /^\s+|\s+$/g, '' );
};

exports.haveEntityValue = function ( input ) {
	switch ( typeof input ) {
		case 'number':
		case 'string':
			return true;

		case 'undefined':
		case 'boolean':
			return false;
	} //sw

	switch ( input ) {
		case undefined:
		case null:
		case true:
		case false:
		case NaN:
		case Infinity:
			return false;
	} //sw

	return true;
};

exports.unEntityValueToDef = function ( input, defineValue ) {
	if ( this.haveEntityValue( input ) ) {
		return input;
	}

	return defineValue;
};

exports.haveValue = function ( input ) {
	switch ( input ) {
		case undefined:
		case null:
		case NaN:
		case Infinity:
			return false;
	}

	//return (input !== null) && (input !== undefined) && (!input.isNaN() && (!input.isFinite()));
	return true;
};

exports.setNoValue = function ( input, output ) {
	if ( this.haveValue( input ) ) {
		return input;
	}
	return output;
};

exports.lazyFirebaseAdmin = function ( certStringOrPath = '', databaseURL = '' ) {
	databaseURL = this.setNoValue( databaseURL, '' );

	//admin.initializeApp(functions.config().firebase);//on firebase

	if ( !admin.apps.length ) {
		//表示尚未初始化

		let inf = {
			credential: admin.credential.cert( require( certStringOrPath ) )
		};

		if ( this.haveEntityValue( databaseURL ) ) {
			inf.databaseURL = databaseURL.toString();
		}

		if ( fs.existsSync( certStringOrPath ) ) {
			//fpath目標存在
			admin.initializeApp( inf ); //on local emu
		} else {
			//fpath目標不存在

			switch ( certStringOrPath.toString().toLowerCase() ) {
				//case 'GCP':
				case 'gcp':
					admin.initializeApp( inf ); //on gcp
					break;

				default:
					admin.initializeApp( functions.config().firebase ); //on firebase
					break;
			} //sw
		} //else
	} //if

	//admin.firestore()

	return admin;
}; //firebaseGetAdmin

exports.jsonCopy = function ( json ) {
	//序列化再反序列為物件//本質是複製
	return JSON.parse( JSON.stringify( json ) );
};

exports.jsonFormatOut = function ( json ) {
	//json轉文字輸出,有格式化.
	return JSON.stringify( json, null, '\t' );
};

exports.cookieGet__session = function ( req ) {
	//取得firebase傳遞的cookie/session , session指定變數名稱不能改
	let token =
		'eyJhbGciOiJSUzI1NiIsImtpZCI6InNrSUJOZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydDE5eTA3MTUiLCJhdWQiOiJzcG9ydDE5eTA3MTUiLCJhdXRoX3RpbWUiOjE1NzI1OTI2OTEsInVzZXJfaWQiOiJibktjVlZhaUlhVWYzZGFWTU5UVEs1Z0g0aGYxIiwic3ViIjoiYm5LY1ZWYWlJYVVmM2RhVk1OVFRLNWdINGhmMSIsImlhdCI6MTU3MjU5MjY5NSwiZXhwIjoxNTczMTk3NDk1LCJlbWFpbCI6ImluYTI1ODhAZ2V0cy1pbmZvLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJpbmEyNTg4QGdldHMtaW5mby5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.NEtTCIDzmbI-OZOXfpgmpZX9zN0bQ0oRHkaeNWr9k_nkRpkt4ZCBSozPTPl1mldxs9awc7Ay2zpIWOoeVrbVRNBnBzZ0HMPyGTqUWpWq4ZWwIrzG5966g59U5U2jMNAxxkRb8UntRgdht4VNT82rttb9Opdg1pE41h_XcoxzPtThJ5UUsGQNvNAsMp6cvKybQDrK_Towd6kSTXYI3hq66v9NnZzJYOrkxvdedNWf6KmVe8LGGiCJHh7NjmXiQmHC1lOs5-sPDhbzwGzDcssFp58cXMuXaPt6t5hDk17lP4aOP2w8ke4GrBk-tjQG7T6C6MyrvdYHNvi9Q8E4uZ2SIg';

	if ( envValues.release ) {
		token = '';
	}

	try {
		let cookies = req.get( 'cookie' );

		token = cookie.parse( cookies ).__session;
	} catch ( e ) {
		//token = undefined;
	}
	return token;
};

/*
exports.utf8lang =
	function (res) {
		//回應標頭設定utf-8 txt,與json輸出共用
		res.set('Content-Type', 'text/html; charset=utf-8'); //plain
		res.set('content-language', 'zh-TW,zh');
		return res;
	}*/

exports.clearJson = function ( json = {} ) {
	if ( envValues.release ) {
		json.stack = undefined;
	}

	//res.send(json);
	return json;
}; //send_json

exports.timestampUTCmsInt = function ( changeDays = 0 ) {
	let Days = parseInt( changeDays.toString() ) || 0;
	if ( Days > 0 || Days < 0 ) {
		return moment()
			.add( Days, 'days' )
			.valueOf();
	}
	return moment().valueOf();
};

exports.timestampUTCmsFloat = function ( changeDays = 0 ) {
	return this.timestampUTCmsInt( changeDays ) * 0.001; //= ans/1000
};

exports.stringSplitToArray = function ( string = '', splitLength = 1 ) {
	if ( splitLength > 1 ) {
		//大於1的做法

		let splits = []; //檔案切割的陣列
		while ( string.length > splitLength ) {
			splits.push( string.substr( 0, splitLength ) ); //取出string前面cutSize的內容
			string = string.substr( splitLength ); //string本身去掉前面cutSize的內容
		}

		if ( string.length > 0 ) {
			//有小於cutSize的殘餘內容
			splits.push( string );
		}

		return splits;
	} // if >1

	//等於1的快捷做法
	return Array.from( string );
};

exports.runFileContentsUpload = async function ( FileSplitArray = [], newDocRef, firestore ) {
	let uploadFileContentIdArray = [];

	try {
		firestore = this.setNoValue( firestore, this.lazyFirebaseAdmin().firestore() );

		FileSplitArray.forEach( async function ( item, index ) {
			//console.log( item, index, array ); // 物件, 索引(非必須), 陣列本身(非必須)
			//return item;//=undefined  // forEach 沒在 return 的，所以這邊寫了也沒用
			let FileSplitDocRef = await firestore.collection( 'uploadFileContents' ).add( {
				fileContent: item,
				sequence: index,
				fileUploadId: newDocRef.id
			} );

			uploadFileContentIdArray.push( FileSplitDocRef.id );
		} );

		//let docRef = firestore.collection('uploadFiles').doc(fileUploadId);
	} catch ( error ) {
		return [];
	}

	return uploadFileContentIdArray;
};

exports.runFileUpload = async function ( fileContent = '', fileType = '', firestore ) {
	let returnJson = {
		success: false
	};

	try {
		if ( !this.haveEntityValue( fileContent ) ) {
			//非實體內容
			returnJson.stack = 'not string or real file';
			return returnJson;
		}

		fileContent = fileContent.toString(); //避免非字串問題

		if ( this.trim( fileContent ).length < 1 ) {
			//內容長度為零
			//returnJson.success = true;
			returnJson.stack = 'file length is zero';
			return returnJson;
		}

		fileContent = fileContent.replace( / /g, '+' ); //避免存入資料庫的問題;

		if ( fileContent.length > 1028096 ) {
			//檔案太大
			//1024*1024=1MB,(1024*(1024-20))=1028096,留20K,切10份各用2K
			//fileToStr
			//內容長度太大
			returnJson.stack = 'file length is too big';
			return returnJson;
		}

		//fileContent = fileToStr

		//驗證與避免碰撞用的hash
		let farmHash1 = myHash.farmHashToInt( fileContent );
		let sipHash1 = myHash.sipHashToInt( fileContent, '' );

		//let fileSize = fileContent.length;

		firestore = this.setNoValue( firestore, this.lazyFirebaseAdmin().firestore() );

		//檢查是否有重複檔案
		let Snapshot = await firestore
			.collection( 'uploadFiles' )
			.where( 'farmHash', '==', farmHash1 )
			.where( 'sipHash', '==', sipHash1 )
			.where( 'fileSize', '==', fileContent.length )
			.limit( 1 )
			.get();

		let fileUploadId = '';

		Snapshot.forEach(
			function ( doc ) {
				let data = doc.data();
				fileUploadId = doc.data().key || '';
				return true;
			} //doc
		); //forEach

		//end_timestamp存活時間戳記
		let endTimestamp = this.timestampUTCmsInt( 100 );

		if ( fileUploadId.length > 0 ) {
			//有重複檔案,取得該重複檔案
			let oldDocRef = firestore.collection( 'uploadFiles' ).doc( fileUploadId );

			//更新存活時間
			let updateStat = await oldDocRef.update( {
				end_timestamp: endTimestamp
			} ); //, { merge: true }

			//returnJson.fileUploadId = fileUploadId;
			returnJson.DocRef = oldDocRef;
			returnJson.success = true;
			return returnJson;
		}

		//沒有重複檔案,切割上傳,先上傳檔案資訊,取得檔案唯一編號

		let newDocRef = await firestore.collection( 'uploadFiles' ).add( {
			endTimestamp: endTimestamp,
			fileSize: fileContent.length,
			farmHash: farmHash1,
			sipHash: sipHash1,
			fileType: fileType
			//'fileName': fileName //存在message因為相同檔案可能有多個不同來源檔名
		} );

		//fileUploadId = newDocRef.id;

		returnJson.fileContent = fileContent; //把編碼過的檔案傳回去
		returnJson.fileType = fileType;

		let fileSplits = this.stringSplitToArray( fileContent, 102810 ); //檔案切割的陣列 //(1024*(1024-20))/10=102809.6=102810,保留約2K放訊息

		//至此,切割完成,清空檔案內容
		fileContent = '';

		//開始上傳分塊,並取回分塊的id陣列
		let fileContentsIdArray = await this.runFileContentsUpload( fileSplits, newDocRef );

		if ( fileContentsIdArray.length < 1 ) {
			//上傳分塊不正常
			returnJson.stack = 'FileContentsUpload error';
			return returnJson;
		}

		//追加存入FileContentsUploads的id陣列
		let updateStat = await newDocRef.update( {
			fileContentsIdArray: fileContentsIdArray
		} ); //, { merge: true }

		returnJson.DocRef = newDocRef;
		returnJson.success = true;
		//return returnJson;
	} catch ( error ) {
		console.warn( 'runFileUpload', error );
		returnJson.stack = error;
	}

	return returnJson;
};

exports.realTimePushData = async function ( pushData = {}, collectionName = 'livePush', realTimeDB ) {
	let pushRefKey = '';

	try {
		realTimeDB = this.setNoValue( realTimeDB, this.lazyFirebaseAdmin().database() );
		var push_ref = await realTimeDB()
			.ref( '/'.concat( collectionName ) )
			.push( pushData );
		pushRefKey = push_ref.key;
		//var push_ref_key = un2def(, '');
	} catch ( error ) {
		console.warn( 'realTimePushData', error );
	}

	return pushRefKey;
};

/*
//初始化資料庫
var myfirebaseAdmin = null;
//var firestore = null;

exports.lazyFirebaseAdmin = function(certStringOrPath='') {
	if ( myfirebaseAdmin === null ) {

		myfirebaseAdmin = this.firebaseGetAdmin(this.setNoValue()); //cert是路徑
	}
	return myfirebaseAdmin;
};

exports.lazyFirebaseFirestore = function() {
	if (firestore === null) {
		firestore = firebaseAdmin.firestore();
	}
	return lazyFirebaseAdmin;
};

exports.lazyFirebase = {
	admin: function() {
		return setNoValue();
	},
	firestore: function() {
		return;
	},
};
*/

/*
exports.authCopyToUsers = async function () { //將auth的用戶資料複製到users表
	let firebaseAdmin = this.firebaseGetAdmin(envValues.cert); //cert是路徑
	//let listUsersResult = await firebaseAdmin.auth().listUsers(500);

	//return listUsersResult;

	let returnArray = [];
	//listUsersResult.users.forEach(function (userRecord) {
	//	//console.log('user', userRecord.toJSON());
	//	returnArray.push(userRecord.toJSON());
	//});

	//returnArray;


	firebaseAdmin.auth().listUsers(500).then(function (listUsersResult) {
			listUsersResult.users.forEach(function (userRecord) {
				console.info(userRecord.toJSON());
			});
			//if (listUsersResult.pageToken) {
			// List next batch of users.
			//	listAllUsers(listUsersResult.pageToken);
			//}
		})
		.catch(function (error) {
			console.log('Error listing users:', error);
		});

}*/

/*
exports.sessionTokenFindUser = async function(sessionToken = '', firestore) {
	if (!this.haveValue(firestore)) {
		//初始化資料庫
		let firebaseAdmin = this.firebaseGetAdmin(envValues.cert); //cert是路徑
		let firestore = firebaseAdmin.firestore();
	}

	sessionToken = this.setNoValue(sessionToken, '');
};
*/

/*
exports.gcpStorageBucket =
	async function (bucket_name, filePath) { //GCP拿儲存桶(證書路徑,桶名稱)

		// Creates a client
		let storage;

		if (fs.existsSync(filePath)) { //證書存在的初始
			storage = new Storage({
				'projectId': mycfg.projectId,
				'keyFilename': filePath
			});
		} else { //沒有證書的初始
			storage = new Storage();
		}

		let [buckets] = await storage.getBuckets(); //取得全部桶名稱
		//console.log('Buckets:');
		let b = false;

		//storage.bucket(bucket_name )

		buckets.forEach(bucket => {
			//	console.log(bucket.name);
			if (bucket.name === bucket_name) {
				b = true;
				return true;
			}

		});

		if (!b) { //沒有桶

			await storage.createBucket(bucket_name, {
				'location': 'us',
				'storageClass': 'multi_regional',
			});

			//await storage.createBucket(bucket_name);

		}

		return storage.bucket(bucket_name);

	} //gcpStorageBucket

*/