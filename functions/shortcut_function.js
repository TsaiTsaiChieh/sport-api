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

const admin = require( "firebase-admin" );
const functions = require( "firebase-functions" );
const fs = require( "fs" );

const cookie = require( "cookie" );

const moment = require( "moment" ); //https://www.npmjs.com/package/moment
//const util = require( 'util' );
const ShortcutFunction = require( "./shortcut_function" );
const envValues = require( "./env_values" );
const ShortcutHash = require( "./shortcut_hash" );

const Buffer = require( 'buffer' ).Buffer

const htmlencode = require( "js-htmlencode" ); //用這個才不會把emoji編碼成亂碼

const users = require( "./users" );

//const { Storage } = require('@google-cloud/storage');

//const admin = require('firebase-admin');
//const functions = require('firebase-functions');

//admin.initializeApp(functions.config().firebase);

//const db = admin.firestore();

//const htmlencode = require('js-htmlencode');

exports.trim = function ( string = "" ) {
	return string.replace( /^\s+|\s+$/g, "" );
};

exports.haveEntityValue = function ( input ) {
	switch ( typeof input ) {
		case "number":
		case "string":
			return true;

		case "undefined":
		case "boolean":
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

exports.lazyFirebaseAdmin = function ( certStringOrPath = "", databaseURL = "https://sport19y0715.firebaseio.com" ) {
	databaseURL = this.setNoValue( databaseURL, "" );

	//admin.initializeApp(functions.config().firebase);//on firebase

	if ( !admin.apps.length ) {
		//表示尚未初始化

		let inf = {
			credential: admin.credential.cert( require( certStringOrPath ) ),
			databaseURL: databaseURL
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
				case "gcp":
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
	return JSON.stringify( json, null, "\t" );
};

exports.cookieGet__session = function ( req ) {
	//取得firebase傳遞的cookie/session , session指定變數名稱不能改
	let token = ""; //

	try {
		let cookies = req.get( "cookie" );

		token = cookie.parse( cookies ).__session || "";
	} catch ( e ) {
		//token = undefined;
	}

	console.info( "token", token );

	if ( ShortcutFunction.trim( token ).length < 1 ) {
		//if ( !envValues.release ) {
		/*token =
			'eyJhbGciOiJSUzI1NiIsImtpZCI6InNrSUJOZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydDE5eTA3MTUiLCJhdWQiOiJzcG9ydDE5eTA3MTUiLCJhdXRoX3RpbWUiOjE1NzI1OTI2OTEsInVzZXJfaWQiOiJibktjVlZhaUlhVWYzZGFWTU5UVEs1Z0g0aGYxIiwic3ViIjoiYm5LY1ZWYWlJYVVmM2RhVk1OVFRLNWdINGhmMSIsImlhdCI6MTU3MjU5MjY5NSwiZXhwIjoxNTczMTk3NDk1LCJlbWFpbCI6ImluYTI1ODhAZ2V0cy1pbmZvLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJpbmEyNTg4QGdldHMtaW5mby5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.NEtTCIDzmbI-OZOXfpgmpZX9zN0bQ0oRHkaeNWr9k_nkRpkt4ZCBSozPTPl1mldxs9awc7Ay2zpIWOoeVrbVRNBnBzZ0HMPyGTqUWpWq4ZWwIrzG5966g59U5U2jMNAxxkRb8UntRgdht4VNT82rttb9Opdg1pE41h_XcoxzPtThJ5UUsGQNvNAsMp6cvKybQDrK_Towd6kSTXYI3hq66v9NnZzJYOrkxvdedNWf6KmVe8LGGiCJHh7NjmXiQmHC1lOs5-sPDhbzwGzDcssFp58cXMuXaPt6t5hDk17lP4aOP2w8ke4GrBk-tjQG7T6C6MyrvdYHNvi9Q8E4uZ2SIg';*/
		//}
	}

	/*
	token =
		'eyJhbGciOiJSUzI1NiIsImtpZCI6InNrSUJOZyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydDE5eTA3MTUiLCJhdWQiOiJzcG9ydDE5eTA3MTUiLCJhdXRoX3RpbWUiOjE1NzI1OTI2OTEsInVzZXJfaWQiOiJibktjVlZhaUlhVWYzZGFWTU5UVEs1Z0g0aGYxIiwic3ViIjoiYm5LY1ZWYWlJYVVmM2RhVk1OVFRLNWdINGhmMSIsImlhdCI6MTU3MjU5MjY5NSwiZXhwIjoxNTczMTk3NDk1LCJlbWFpbCI6ImluYTI1ODhAZ2V0cy1pbmZvLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJpbmEyNTg4QGdldHMtaW5mby5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.NEtTCIDzmbI-OZOXfpgmpZX9zN0bQ0oRHkaeNWr9k_nkRpkt4ZCBSozPTPl1mldxs9awc7Ay2zpIWOoeVrbVRNBnBzZ0HMPyGTqUWpWq4ZWwIrzG5966g59U5U2jMNAxxkRb8UntRgdht4VNT82rttb9Opdg1pE41h_XcoxzPtThJ5UUsGQNvNAsMp6cvKybQDrK_Towd6kSTXYI3hq66v9NnZzJYOrkxvdedNWf6KmVe8LGGiCJHh7NjmXiQmHC1lOs5-sPDhbzwGzDcssFp58cXMuXaPt6t5hDk17lP4aOP2w8ke4GrBk-tjQG7T6C6MyrvdYHNvi9Q8E4uZ2SIg';
		*/

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
			.add( Days, "days" )
			.valueOf();
	}
	return moment().valueOf();
};

exports.timestampUTCmsSconds = function ( changeSconds = 0 ) {
	let Days = parseInt( changeSconds.toString() ) || 0;
	if ( Days > 0 || Days < 0 ) {
		return moment()
			.add( Days, "seconds" )
			.valueOf();
	}
	return moment().valueOf();
};

exports.timestampUTCmsFloat = function ( changeDays = 0 ) {
	return this.timestampUTCmsInt( changeDays ) * 0.001; //= ans/1000
};

exports.stringSplitToArray = function ( string = "", splitLength = 1 ) {
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

async function asyncAwaitSeridArrayDemo() {
	const files = []; //await getFilePaths();

	for ( const file of files ) {
		// @ts-ignore
		const contents = await fs.readFile( file, "utf8" );
		console.log( contents );
	}
}

exports.runFileContentsUpload = async function ( FileSplitArray = [], newDocRef, firestore ) {
	let uploadFileContentIdArray = [];

	let returnJson = {
		success: false
	};

	try {
		firestore = this.setNoValue( firestore, this.lazyFirebaseAdmin().firestore() );

		//===================================================================================

		let i = 0;

		for ( const SplitFile of FileSplitArray ) {
			// @ts-ignore
			//const contents = await fs.readFile( file, 'utf8' );
			let FileSplitDocRef = await firestore.collection( "uploadFileContents" ).add( {
				fileContent: SplitFile,
				sequence: i,
				fileUploadId: newDocRef.id
			} );

			uploadFileContentIdArray.push( FileSplitDocRef.id );

			i++;

			console.log( "FileSplitDocRef.id====================", FileSplitDocRef.id );
		}
		//=================================================================================

		/*
		FileSplitArray.forEach( async function ( item, index ) {
			//console.log( item, index, array ); // 物件, 索引(非必須), 陣列本身(非必須)
			//return item;//=undefined  // forEach 沒在 return 的，所以這邊寫了也沒用
			let FileSplitDocRef = await firestore.collection( 'uploadFileContents' ).add( {
				fileContent: item,
				sequence: index,
				fileUploadId: newDocRef.id
			} );

			uploadFileContentIdArray.push( FileSplitDocRef.id );
		} );*/

		//let docRef = firestore.collection('uploadFiles').doc(fileUploadId);

		console.log( "uploadFileContentIdArray  ====================", uploadFileContentIdArray );

		returnJson.success = true;
	} catch ( error ) {
		returnJson.uploadFileContentIdArray = uploadFileContentIdArray;
		returnJson.error = error;
		return returnJson;
		//return uploadFileContentIdArray;
	}

	returnJson.list = uploadFileContentIdArray;
	return returnJson;
};

exports.base64SplitStr = ";base64,"; //base64檔案內容切割與合併用

exports.fileCheckAndReplace = function ( fileContent = "", fileType = "" ) {
	let returnJson = {
		success: false,
		fileSize: 0,
		fileContent: fileContent || "",
		fileType: fileType || ""
	};

	try {
		if ( !this.haveEntityValue( fileContent ) ) {
			//非實體內容
			returnJson.error = "檔案不存在";
			//returnJson.fileSize = 0;
			//returnJson.success = true;
			return returnJson;
		}

		fileContent = returnJson.fileContent.toString(); //避免非字串問題

		if ( this.trim( fileContent ).length < 1 ) {
			//內容長度為零
			//returnJson.success = true;
			returnJson.error = "沒有檔案或是沒有檔案內容";
			//returnJson.fileSize = 0;
			return returnJson;
		}

		fileType = this.trim( returnJson.fileType );

		if ( fileContent.indexOf( this.base64SplitStr ) > 0 ) {
			//這是一個base64檔案,並且有檔案格式在前
			let fileType0 = this.trim( fileContent.split( this.base64SplitStr )[ 0 ] );
			if ( fileType0.length > 0 ) {
				fileType = fileType0;
			}
		} else {
			returnJson.error = "注意,不是base64內容";
		}

		returnJson.fileContent = fileContent.replace( / /g, "+" ); //避免存入資料庫的問題;

		returnJson.fileSize = returnJson.fileContent.length; //更正大小

		if ( returnJson.fileSize > 1028096 ) {
			//檔案太大
			//1024*1024=1MB,(1024*(1024-20))=1028096,留20K,切10份各用2K
			//fileToStr
			//內容長度太大
			returnJson.error = "檔案體積太大";
			return returnJson;
		}

		//if (fileType0.length < 1) {
		//	fileType0 = this.trim(fileType || "");
		//}

		returnJson.fileType = fileType;

		returnJson.success = true;

		return returnJson;
	} catch ( error ) {
		console.warn( error );
		returnJson.error = error;
	}

	return returnJson;
};

exports.runFileUpload = async function ( fileInfo = {}, firestore ) {
	let returnJson = {
		success: false
	};

	try {
		//驗證與避免碰撞用的hash
		let farmHash1 = ShortcutHash.farmHashToInt( fileInfo.fileContent );
		let sipHash1 = ShortcutHash.sipHashToHex( fileInfo.fileContent );

		//let fileSize = fileContent.length;

		firestore = this.setNoValue( firestore, this.lazyFirebaseAdmin().firestore() );

		//檢查是否有重複檔案
		let Snapshot = await firestore
			.collection( "uploadFiles" )
			.where( "fileFarmHash", "==", farmHash1 )
			.where( "fileSipHash", "==", sipHash1 )
			.where( "fileSize", "==", fileInfo.fileSize )
			.limit( 1 )
			.get();

		let fileUploadId = "";

		Snapshot.forEach(
			function ( doc ) {
				//let data = doc.data();
				fileUploadId = doc.data().key || "";
				return true;
			} //doc
		); //forEach

		//end_timestamp存活時間戳記
		//let endTimestamp = this.timestampUTCmsInt( 1 ); //1天

		if ( fileUploadId.length > 0 ) {
			//有重複檔案,取得該重複檔案
			let oldDocRef = firestore.collection( "uploadFiles" ).doc( fileUploadId );

			returnJson.fileUploadId = fileUploadId;
			returnJson.DocRef = oldDocRef;
			//目前此處有錯
			returnJson.success = true;

			//更新存活時間
			let updateStat = await oldDocRef.update( {
				end_timestamp: this.timestampUTCmsInt( 100 )
			} ); //, { merge: true }

			return returnJson;
		}

		//沒有重複檔案,切割上傳,先上傳檔案資訊,取得檔案唯一編號

		let newDocRef = await firestore.collection( "uploadFiles" ).add( {
			endTimestamp: this.timestampUTCmsSconds( 300 ), //300秒(完成再改100天),
			fileSize: fileInfo.fileSize,
			fileFarmHash: farmHash1,
			fileSipHash: sipHash1
			//,fileType: htmlencode.htmlEncode( fileInfo.fileType )
			//,'fileName': fileName //存在message因為相同檔案可能有多個不同來源檔名
		} );

		fileUploadId = newDocRef.id;

		returnJson.fileUploadId = fileUploadId;

		console.info( "fileUploadId >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", fileUploadId );

		//returnJson.fileContent = fileContent; //把編碼過的檔案傳回去
		//returnJson.fileType = newDocRef.fileType;

		//let fileContent = fileInfo.fileContent;

		let fileSplitArray = this.stringSplitToArray( fileInfo.fileContent, 102810 ); //檔案切割的陣列 //(1024*(1024-20))/10=102809.6=102810,保留約2K放訊息

		//console.info( 'fileSplitArray =============', fileSplitArray );

		//至此,切割完成,清空檔案內容
		//fileContent = "";

		//開始上傳分塊,並取回分塊的id陣列
		let FileContentsUploadReturnJson = await this.runFileContentsUpload( fileSplitArray, newDocRef );
		console.info( "FileContentsUploadReturnJson =============", FileContentsUploadReturnJson );
		let fileContentsIdArray = FileContentsUploadReturnJson.list;

		if ( fileContentsIdArray.length < 1 ) {
			//上傳分塊不正常
			returnJson.error = "上傳失敗 : 分塊上傳不正常";
			returnJson.FileContentsUploadReturnJson = FileContentsUploadReturnJson;
			return returnJson;
		}

		//追加存入FileContentsUploads的id陣列
		let updateStat = await newDocRef.update( {
			endTimestamp: this.timestampUTCmsInt( 100 ), //100天,
			fileContentsIdArray: fileContentsIdArray
		} ); //, { merge: true }

		//console.info( '================== newDocRef===================', newDocRef );

		returnJson.DocRef = newDocRef;
		returnJson.success = true;
		//return returnJson;
	} catch ( error ) {
		console.warn( "runFileUpload", error );
		returnJson.error = error;
	}

	return returnJson;
};

exports.ParseInt = function ( input, defineValue, numberSystem = 10 ) {
	if ( Number.isInteger( input ) ) {
		return parseInt( input.toString(), numberSystem );
	}

	return defineValue;
};

exports.realtimePush = async function ( pushData = {}, channel = "public", subPath1 = "livePush" ) {
	channel = pushData.channel || channel || "public";

	let returnJson = {
		success: false,
		subPath1: subPath1,
		channel: channel,
		pushData: pushData
	};

	try {
		let replyMessageId = this.trim( pushData.replyMessageId || "" );
		if ( replyMessageId.length > 0 ) {
			console.info( "replyMessageId", replyMessageId );
			returnJson.replyMessage = await this.getOneMessage( {}, replyMessageId );
			console.info( "replyMessage", returnJson.replyMessage );
		}

		let firebaseAdmin = this.lazyFirebaseAdmin( envValues.cert, "https://sport19y0715.firebaseio.com" );

		let push = firebaseAdmin
			.database()
			.ref( subPath1 )
			.push();

		push.set( pushData );

		returnJson.success = true;
	} catch ( error ) {
		console.info( "message push error ==========================", error );
		returnJson.error = error;
	}

	return returnJson;
};

exports.getOneMessage = async function ( req, messageId2 = "", again = true ) {
	//只取一個訊息
	//userId = userId.toString();

	let returnJson = {
		success: false
	};

	try {
		console.info( "getOneMessage" );

		//let body = req.body;

		let messageId = this.trim( messageId2 || "" );

		if ( messageId.length < 1 ) {
			if ( !ShortcutFunction.haveEntityValue( req.body.messageId ) ) {
				returnJson.error = "沒有訊息編號";
				console.info( "getOneMessage 1111111111111", returnJson );
				return returnJson;
			}

			messageId = this.trim( req.body.messageId || "" );
		}

		if ( messageId.length < 1 ) {
			messageId = ShortcutFunction.trim( messageId2 || "" );
		}

		if ( messageId.length < 1 ) {
			returnJson.error = "沒有訊息編號";
			console.info( "getOneMessage 2222222222222", returnJson );
			return returnJson;
		}

		let firestore = this.lazyFirebaseAdmin().firestore();

		let docSnapshot = await firestore
			.collection( "messages" )
			.doc( messageId )
			.get();

		let data = docSnapshot.data();

		if ( data === undefined ) {
			returnJson.error = "沒有此訊息 333333333333333";
			//console.info( "getOneMessage 3333333333333333", returnJson );
			returnJson.messageId = messageId;
			return returnJson;
		}

		switch ( Number.parseInt( data.softDelete, 10 ) || 999 ) {
			case -1: //管理員刪除(全域)
				returnJson.error = "沒有此訊息";
				console.info( "getOneMessage 4444444444444", returnJson );
				return returnJson;
				//break;

			case 0: //用戶回收(全域刪除)
				returnJson.error = "沒有此訊息";
				console.info( "getOneMessage 5555555555555555", returnJson );
				return returnJson;
				//break;

			case 1: //用戶刪除(對自己隱藏)
				var userData = await users.authVerfyGetUserData( req );

				if ( data.uid === userData.uid ) {
					//如果是隱藏自己的訊息,並且就是自己的訊息,就不要了.
					returnJson.error = "訊息已經刪除";
					console.info( "getOneMessage 66666666666", returnJson );
					return returnJson;
				}
				break;
		}

		//取得訊息作者資料補進去
		let messageUser = await users.usersGetData( data.uid );

		console.info( "getOneMessage messageUser 7777777777777777", messageUser );
		data.messageId = messageId;
		data.displayName = messageUser.displayName;
		data.headPictureUri = messageUser.headPictureUri;

		delete data.softDelete; //隱藏刪除狀態
		delete data.reports; //隱藏檢舉清單

		data.success = true;
		return data;
		//returnJson.list = data;
		returnJson.success = true;
	} catch ( error ) {
		returnJson.error = error;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()

	return returnJson;
};




exports.getOneFile = async function ( req, param2 = '' ) {
	//只取一個訊息
	//userId = userId.toString();

	let returnJson = {
		success: false
	};

	try {
		console.info( "getOneFile" );

		let body = req.body;

		let fileId = this.trim( body.fileId || param2 || "" );

		if ( fileId.length < 1 ) {
			returnJson.error = '沒有檔案編號fileIdId';
			return returnJson;
		}

		let firestore = this.lazyFirebaseAdmin().firestore();

		//組合檔案
		let Snapshot = await firestore
			.collection( "uploadFileContents" )
			.where( "fileUploadId", "==", fileId )
			.orderBy( "sequence" ) //
			.get();

		let fireArray = [];

		Snapshot.forEach(
			function ( doc ) {
				let data = doc.data();

				//console.info( 'data>>>>>>>>>', data );

				fireArray.push( data.fileContent );
				//data.

			} //doc
		); //forEach

		let base64 = fireArray.join( '' );
		let headLength = base64.indexOf( this.base64SplitStr );

		if ( headLength > -1 ) {
			base64 = base64.substr( headLength + this.base64SplitStr.length );
		}

		returnJson.file = base64;


		returnJson.buffer = Buffer.from( base64, 'base64' );

		return returnJson;

	} catch ( error ) {
		console.warn( 'getOneFile', error );
		returnJson.error = error;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()

	return returnJson;
};