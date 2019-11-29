/* eslint-disable no-fallthrough */
/* eslint-disable no-duplicate-case */
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
const fieldValue = admin.firestore.FieldValue;
const firebaseTime = admin.firestore.Timestamp;
const functions = require( "firebase-functions" );
const fs = require( "fs" );

const cookie = require( "cookie" );

const moment = require( "moment" ); //https://www.npmjs.com/package/moment
//const util = require( 'util' );
const ShortcutFunction = require( "./shortcut_function" );
const envValues = require( "./env_values" );
const ShortcutHash = require( "./shortcut_hash" );
const FileType = require( 'file-type' );
const Buffer = require( 'buffer' );
const farmhash = require( 'farmhash' );

const htmlencode = require( "js-htmlencode" ); //用這個才不會把emoji編碼成亂碼

const users = require( "./users" );

const {
	Storage
} = require( '@google-cloud/storage' );

//const admin = require('firebase-admin');
//const functions = require('firebase-functions');

//admin.initializeApp(functions.config().firebase);

//const db = admin.firestore();

//const htmlencode = require('js-htmlencode');

exports.trim = function ( string ) {

	// Undefined "undefined"
	// Null "object"
	// Boolean "boolean"
	// Number "number"
	// String "string"
	// 主機端物件( 由 JS 執行環境提供 ) 視實作方式而異
	// Function 物件( 實作 ECMA - 262 所定義的[ [ Call ] ] )
	// "function"
	// E4X XML 物件 "xml"
	// E4X XMLList 物件 "xml"
	// 所有其它物件 "object"
	//類型 '"xml"' 無法和類型 '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"'

	let i1 = Symbol( 1 );
	i1.toString();


	let type1 = typeof ( string );

	switch ( type1 ) {
		case "object":
			if ( string !== null ) {
				return string;
			}
			case "undefined":
			case "boolean":
				return '';

				// @ts-ignore
			case "xml":
			case "symbol":
			case "function":
				return string;

			case "number":
				try {
					let i = Number.parseFloat( string );
					if ( Number.isNaN( i ) ) {
						return '';
					}

					if ( i === Infinity ) {
						return '';
					}
				} catch ( error ) {
					//
				}
				//return string;

				//case "string":
				//case "bigint":
				default:
					//return ''.concat( string ).replace( /^\s+|\s+$/g, "" );
					break;
	}

	return ''.concat( string ).replace( /^\s+|\s+$/g, "" );
};

exports.haveEntityValue = function ( input ) {
	//是否有實體的數值,是否算非實體,NaN算非實體,Infinity非實體

	let type1 = typeof ( input );

	switch ( type1 ) {
		case "object":
			return input !== null;

		case "undefined":
		case "boolean":
			return false;

		case "number":
			try {
				let i = Number.parseFloat( input );
				if ( Number.isNaN( i ) ) { //NaN 非實體
					return false;
				}

				if ( i === Infinity ) { //Infinity 非實體
					return false;
				}

			} catch ( error ) {
				//
			}

			//case "symbol": //實體 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol

			// @ts-ignore
			//case "xml":  //實體

			//case "function"://非值

			//case "string"://實體
			//case "bigint"://實體
			//default:
			//return ''.concat( string ).replace( /^\s+|\s+$/g, "" );
			//return false;
			break;
	}

	return true;
};

exports.unEntityValueToDef = function ( input, def ) {
	if ( this.haveEntityValue( input ) ) {
		return input;
	}

	return def;
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

exports.setNoValue = function ( input, def ) {

	if ( input === undefined ) {
		return def;
	}

	if ( input === null ) {
		return def;
	}

	return input;
};

exports.IntfromAny = function ( any, def = 0, decimal = 10 ) {
	let i = def;

	i = Number.parseInt( any, decimal );
	if ( Number.isNaN( i ) ) {
		return def;
	}

	if ( i === Infinity ) {
		return def;
	}

	return i;
};

exports.FloatfromAny = function ( any, def = 0 ) {
	let i = def;

	i = Number.parseFloat( any );

	if ( Number.isNaN( i ) ) {
		return def;
	}

	if ( i === Infinity ) {
		return def;
	}

	return i;
};

exports.lazyFirebaseAdmin = function ( certStringOrPath = "", databaseURL = envValues.firebaseConfig.databaseURL ) {
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
		let cookies = req.get( "cookie" ) || '';

		return cookie.parse( cookies ).__session || '';
	} catch ( e ) {
		console.warn( 'cookieGet__session   catchcatchcatchcatch', e );
		return '';
	}

	console.info( "cookieGet__session >>>>>>>  token", token );

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

exports.timestampUTCmsInt = function ( changeDays ) {

	let Days = this.IntfromAny( changeDays, 0 );

	if ( Days !== 0 ) {
		return moment()
			.add( Days, "days" )
			.valueOf();
	}
	return moment().valueOf();
};

exports.timestampUTCmsSconds = function ( changeSconds ) {


	let Sconds = this.IntfromAny( changeSconds, 0 );

	if ( Sconds !== 0 ) {
		return moment()
			.add( Sconds, "seconds" )
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

/*
async function asyncAwaitSeridArrayDemo() {
	const files = []; //await getFilePaths();

	for ( const file of files ) {
		// @ts-ignore
		const contents = await fs.readFile( file, "utf8" );
		console.log( contents );
	}
}
*/

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

		fileContent = ''.concat( returnJson.fileContent ); //避免非字串問題

		if ( this.trim( fileContent ).length < 1 ) {
			//內容長度為零
			//returnJson.success = true;
			returnJson.error = "沒有檔案或是沒有檔案內容";
			//returnJson.fileSize = 0;
			return returnJson;
		}

		fileType = returnJson.fileType || '';
		fileType = this.trim( fileType );


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

exports.runFileUpload5t = async function ( fileUrl = '', firestore ) {
	let returnJson = {
		success: false
	};

	try {
		fileUrl = fileUrl.toString();
		returnJson.fileUrl = fileUrl;

		//前置網址
		let prePath = envValues.firebaseConfig.storageBucket.concat( '/o/' );
		let idx_pre = fileUrl.lastIndexOf( prePath );

		if ( idx_pre > -1 ) { //網址有效
			fileUrl = fileUrl.substr( idx_pre + prePath.length ); //去掉前置網址,留下中間路徑
		} else {
			returnJson.error = '無效檔案網址';
			return returnJson;
		}

		//網址後參數
		let idx_pama = fileUrl.indexOf( '?' );
		if ( idx_pama > -1 ) {
			fileUrl = fileUrl.substr( 0, idx_pama ); //去掉後面參數
		}

		if ( fileUrl.length < 1 ) { //路徑0長度
			returnJson.error = '無效檔案網址';
			return returnJson;
		} // if >0

		fileUrl = decodeURIComponent( fileUrl ); //必須處理%編碼
		returnJson.decodeURIComponent = fileUrl;

		const storage5t = new Storage( {
			'keyFilename': envValues.cert,
			'projectId': envValues.firebaseConfig.projectId
		} );

		let bucket1 = storage5t.bucket( envValues.firebaseConfig.storageBucket ); //用專案資訊取得儲存桶

		let bucketFile1 = bucket1.file( fileUrl );

		//console.info( 'bucketFile1.id >>>>>>>>>>>>>> \n', bucketFile1.id );
		let buckeFile1isExists = ( await bucketFile1.exists() )[ 0 ];
		if ( !buckeFile1isExists ) {
			returnJson.error = '無效檔案網址';
			return returnJson;
		}

		let bfileBuffer = ( await bucketFile1.download() )[ 0 ]; //VVVVVV
		//returnJson.bfileBuffer = bfileBuffer; //VVVVVVV

		returnJson.sipHash = ShortcutHash.BufferToSipHashHex( bfileBuffer ) || '';
		returnJson.farmHash = ShortcutHash.farmHashToInt( bfileBuffer ) || '';

		returnJson.fileType = 'application/octet-stream'; //stream是未知格式的預設
		returnJson.fileSubName = 'tmp'; //預設的未知格式的副檔名

		try {
			let fType = FileType( bfileBuffer ); // or undefined
			//{
			//"ext": "jpg",
			//"mime": "image/jpeg"
			//}

			returnJson.fileType = fType.mime || returnJson.fileType;
			returnJson.fileSubName = fType.ext || returnJson.fileSubName;
		} catch ( error ) {
			returnJson.warn = '解析檔案內容格式失敗';
		}

		delete returnJson.bfileBuffer;

		let fileUploadId = ''.concat( returnJson.farmHash, '_', returnJson.sipHash ); //用hash建立fileUploadId
		returnJson.fileUploadId = fileUploadId;

		//console.info( 'fileUploadId >>>>>>>>>>>>>> ', fileUploadId );

		//確認正確位置是否有檔案
		let path2 = ''.concat( envValues.sharefilePath5T, fileUploadId, '.', returnJson.fileSubName ); //正式位置路徑
		//let buckeFile2 = ;
		console.info( 'path2 >>>>>>>>>>>>>> ', path2 );

		firestore = this.setNoValue( firestore, this.lazyFirebaseAdmin().firestore() );

		let buckeFile2 = bucket1.file( path2 ); //不要encodeURIComponent

		console.info( 'buckeFile2.id >>>>>>>>>>>>>> \n', buckeFile2.id );

		let buckeFile2isExists = ( await buckeFile2.exists() )[ 0 ];

		console.info( 'buckeFile2isExists >>>>>>>>>>>>>> ', buckeFile2isExists );


		if ( !buckeFile2isExists ) { //不存在,移動到正式位置
			let moveStat = await bucketFile1.move( buckeFile2 ); //先移動到正式位置
			//console.info( 'moveStat >>>>>>>>>>>>> \n', moveStat );
			let setStat = await buckeFile2.setMetadata( {
				contentType: returnJson.fileType
			} );
		}

		try {
			let deleteStat = await bucketFile1.delete(); //殺掉暫存檔
		} catch ( errorDeleteStat ) {
			//刪除失敗就算了
		}

		//let metadata2 = ( await buckeFile2.getMetadata() )[ 0 ];

		//取得檔案資訊
		let doc = await firestore
			.collection( "uploadFiles" )
			.doc( fileUploadId )
			.get();

		let data = doc.data();

		//let endTimestamp1 = ;
		//let firebaseEndTimestamp1 = this.jsTimeTOfireBaseTime( ShortcutFunction.timestampUTCmsInt( 7 ) );

		let uploadFileData = {
			endTimestamp: this.jsTimeTOfireBaseTime( ShortcutFunction.timestampUTCmsInt( 7 ) ) //ShortcutFunction.timestampUTCmsInt( 100 ) //更新存活時間
		};

		if ( data === undefined ) { //資料庫沒有紀錄,補充紀錄
			let metadata2 = ( await buckeFile2.getMetadata() )[ 0 ];

			uploadFileData.fileUploadId = fileUploadId;
			uploadFileData.fileFarmHash = returnJson.farmHash;
			uploadFileData.fileSipHash = returnJson.sipHash;
			uploadFileData.fileType = returnJson.fileType;
			uploadFileData.fileSubName = returnJson.fileSubName;
			uploadFileData.fileSize = metadata2.size
			//,	bucketPath: path2

		} // if undefined

		//更新存入uploadFiles
		let docRef = firestore.collection( 'uploadFiles' ).doc( fileUploadId );

		returnJson.DocRef = docRef;

		let setWithOptions = await docRef.set( uploadFileData, {
			merge: true
		} );

		returnJson.setWithOptions = setWithOptions;

		//再次取出來
		doc = await firestore
			.collection( "uploadFiles" )
			.doc( fileUploadId )
			.get();

		data = doc.data();


		returnJson.success = true;
		data.history = returnJson;

		//returnJson.fileData = data;

		data.success = true;

		return data;

	} catch ( error ) {
		console.warn( "runFileUpload error  error  error  error  \n", error );
		returnJson.error = error;
	}

	return returnJson;
};



exports.jsTimeTOfireBaseTime = function ( msTimeInt = 0 ) {

	return firebaseTime.fromDate( new Date( msTimeInt ) );
}

exports.fireBaseTimeToJsTimeFloat = function ( firebaseTimeJson = {} ) {
	//returnJson = {};

	let seconds = this.IntfromAny( firebaseTimeJson.seconds, 0 );
	let nanoseconds = this.IntfromAny( firebaseTimeJson.nanoseconds, 0 );

	let msFloat = ( seconds * 1000 ) + ( nanoseconds * 0.000001 );
	return msFloat;
}

exports.fireBaseTimeToJsTime = function ( firebaseTimeJson = {} ) {
	return Math.ceil( this.fireBaseTimeToJsTimeFloat( firebaseTimeJson ) );
}


// {
// 	"_seconds": 1573194036, //UTC格式(秒),前端用let a=new Date( _seconds ) 即可使用
// 	"_nanoseconds": 370000000 //奈秒時間,組合使用
// }

// js Date().getTime() = 1574992723666 //UTC格式(微秒)

// 差異與交換:

// 	//firebase時間格式 轉 js微秒格式
// 	js UTC = Math.ceil( ( _seconds * 1000 ) + math.round( _nanoseconds * 0.000001 ) )

// //js微秒時間轉firebase時間格式
// let jsUTC = Date().getTime();
// let firebaseTime = {};
// let jsTimeFloat = jsUTC * 0.001;
// firebaseTime._seconds = Math.ceil( jsTimeFloat );
// firebaseTime._nanoseconds = ( jsTimeFloat - firebaseTime._seconds ) * 100000


/*
exports.__runFileUpload = async function ( fileInfo = {}, firestore ) {
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

exports.__ParseInt = function ( input, defineValue, numberSystem = 10 ) {
	if ( Number.isInteger( input.toString() ) ) {
		return parseInt( input.toString(), numberSystem );
	}

	return defineValue;
};
*/

exports.realtimePush = async function ( pushData = {}, channelId = "public", subPath1 = "livePush" ) {


	let returnJson = {
		success: false,
		subPath1: subPath1,
		pushData: pushData
	};

	try {
		channelId = pushData.channelId || channelId || "public";
		returnJson.channelId = channelId;

		let replyMessageId = pushData.replyMessageId || "";
		replyMessageId = this.trim( replyMessageId );

		/*
		if ( replyMessageId.length > 0 ) {
			console.info( "replyMessageId", replyMessageId );
			returnJson.replyMessage = await this.getOneMessage( {}, replyMessageId );
			console.info( "replyMessage", returnJson.replyMessage );
		}*/

		let firebaseAdmin = this.lazyFirebaseAdmin( envValues.cert );

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

exports.getOneMessage = async function ( inputJson = {}, messageId2 = "" ) {
	//只取一個訊息
	//userId = userId.toString();

	let returnJson = {
		success: false
	};

	try {
		console.info( "getOneMessage" );

		//let body = req.body;

		let messageId = messageId2 || "";
		messageId = this.trim( messageId2 );


		if ( messageId.length < 1 ) {
			if ( !ShortcutFunction.haveEntityValue( inputJson.body.messageId ) ) {
				returnJson.error = "沒有訊息編號";
				console.info( "getOneMessage 1111111111111", returnJson );
				return returnJson;
			}

			messageId = inputJson.body.messageId || "";

			messageId = this.trim( messageId );
		}

		if ( messageId.length < 1 ) {
			messageId = messageId2 || "";
			messageId = ShortcutFunction.trim( messageId );
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

		console.info( 'getOneMessage >>>>>>>>>>>>>>>>>>>>\n', data );



		let softDelete = 2;
		if ( !Number.isNaN( data.softDelete ) ) {
			Number.parseInt( data.softDelete, 10 );
		}

		switch ( softDelete ) {
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
				var userData = await users.userIdToUserData( inputJson.idToken.uid );

				if ( data.uid === userData.uid ) {
					//如果是隱藏自己的訊息,並且就是自己的訊息,就不要了.
					returnJson.error = "訊息已經刪除";
					console.info( "getOneMessage 66666666666", returnJson );
					return returnJson;
				}
				break;
		}

		//取得訊息作者資料補進去
		let messageUser = await users.userIdToUserData( data.uid );

		console.info( "getOneMessage messageUser 7777777777777777", messageUser );
		data.messageId = messageId;
		data.displayName = messageUser.displayName || '';
		data.avatar = messageUser.avatar || '';
		data.title = messageUser.title || '';

		delete data.softDelete; //隱藏刪除狀態
		delete data.reports; //隱藏檢舉清單

		let fileUploadId = data.fileUploadId || '';

		//if ( fileUploadId.length > 0 ) {
		let fireJson = await this.getOneShareFile( undefined, fileUploadId ); //失敗也沒關係,用空值填充
		console.info( 'getOneMessage   getOneShareFile 888888888888888888\n', fireJson );
		//{
		//fileUploadId: fileUploadId,
		//	endTimestamp: ShortcutFunction.timestampUTCmsInt( 100 ),
		//	fileFarmHash: returnJson.farmHash,
		//	fileSipHash: returnJson.sipHash,
		//	fileType: returnJson.fileType,
		//	fileSubName: returnJson.fileSubName,
		//	fileSize: metadata2.size
		//}

		//if ( fireJson.success ) {
		data.fileType = fireJson.fileType || '';
		data.fileSize = fireJson.fileSize || 0;
		data.fileSubName = fireJson.fileSubName || '';
		data.fileFarmHash = fireJson.fileFarmHash || '';
		data.fileSipHash = fireJson.fileSipHash || '';
		data.fileURL = '';
		if ( fileUploadId.length > 0 ) {
			data.fileURL = '/messages/file/'.concat( fileUploadId );
		}


		console.info( 'getOneMessage  getOneShareFile data  999999999999999999 \n', data );
		//} //if fireJson.success

		//} //if fileUploadId.length > 0

		data.success = true;
		return data;
		//returnJson.list = data;
		//returnJson.success = true;
	} catch ( error ) {
		returnJson.error = error;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()

	return returnJson;
};

exports.getOneShareFile = async function ( inputJson = {}, fileUploadId2 = '', needBuffer = false ) {
	//只取一個訊息
	//userId = userId.toString();

	let returnJson = {
		success: false
	};

	try {
		console.info( "getOneFile" );

		let body = inputJson.body || {};

		let fileUploadId = body.fileUploadId || fileUploadId2 || "";

		fileUploadId = this.trim( fileUploadId );

		if ( fileUploadId.length < 1 ) {
			returnJson.error = '沒有檔案編號fileUploadId';
			return returnJson;
		}

		let firestore = this.lazyFirebaseAdmin().firestore();

		let doc = await firestore
			.collection( "uploadFiles" )
			.doc( fileUploadId )
			.get();

		//console.info("doc >>>>>>>>", doc);

		let data = doc.data();
		console.info( 'getOneShareFile >>>>>>>>>>>>>>>\n', data );
		//uploadFileData = {
		//fileUploadId: fileUploadId,
		//	endTimestamp: ShortcutFunction.timestampUTCmsInt( 100 ),
		//	fileFarmHash: returnJson.farmHash,
		//	fileSipHash: returnJson.sipHash,
		//	fileType: returnJson.fileType,
		//	fileSubName: returnJson.fileSubName,
		//	fileSize: metadata2.size
		//	//,	bucketPath: path2
		//	buffer
		//}

		if ( data === undefined ) {
			returnJson.error = '檔案不存在';
			return returnJson;
		}

		//needBuffer需要返回檔案內容

		if ( needBuffer ) {
			//更新存活時間
			let oldDocRef = firestore.collection( "uploadFiles" ).doc( fileUploadId );

			let updateStat = await oldDocRef.update( {
				end_timestamp: this.jsTimeTOfireBaseTime( this.timestampUTCmsInt( 7 ) )
			} ); //, { merge: true }
			//returnJson.updateStat = updateStat;
			//更新存活時間完成

			const storage5t = new Storage( {
				keyFilename: envValues.cert,
				projectId: envValues.firebaseConfig.projectId
			} );

			let bucket1 = storage5t.bucket( envValues.firebaseConfig.storageBucket );

			let buckeFile1 = bucket1.file( ''.concat( envValues.sharefilePath5T, fileUploadId, '.', data.fileSubName ) );

			data.buffer = ( await buckeFile1.download() )[ 0 ];
		}

		returnJson.success = true;

		data.success = true;
		data.history = returnJson;

		//returnJson.buffer = Buffer.from( base64, 'base64' );

		return data;
	} catch ( error ) {
		console.warn( 'getOneFile', error );
		returnJson.error = error;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()

	return returnJson;
};

exports.__getOneFile = async function ( inputJson = {}, param2 = '' ) {
	//只取一個訊息
	//userId = userId.toString();

	let returnJson = {
		success: false
	};

	try {
		console.info( "getOneFile" );

		let body = inputJson.body;

		let fileUploadId = body.fileUploadId || param2 || "";
		fileUploadId = this.trim( fileUploadId );

		if ( fileUploadId.length < 1 ) {
			returnJson.error = '沒有檔案編號fileUploadId';
			return returnJson;
		}

		let firestore = this.lazyFirebaseAdmin().firestore();

		//組合檔案
		let Snapshot = await firestore
			.collection( "uploadFileContents" )
			.where( "fileUploadId", "==", fileUploadId )
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


		// @ts-ignore
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



exports.sessionToDecodedIdToken = async ( __session = '', firebaseAdmin ) => {

	try {

		let decodedIdToken = await firebaseAdmin.auth().verifySessionCookie(
			__session, true ) || {};

		console.info( '__sessionToDecodedIdToken  decodedIdToken   >>>>>>', decodedIdToken );

		//{
		//	"success": true,
		//	"userData": {
		//		"email": "ina2588@gets-info.com",
		//		"displayName": "路人甲bnKcVVaiIaUf3daVMNTTK5gH4hf1",
		//		"avatar": "data:image/png;base64,",
		//		"uid": "bnKcVVaiIaUf3daVMNTTK5gH4hf1"
		//	}
		//}

		return decodedIdToken;

	} catch ( error ) {
		console.warn( '__sessionToDecodedIdToken  Auth - verifySessionCookie false : ', error );
		return {
			error: error
		};
	}
	return {};

	/*
	await admin.auth().verifySessionCookie(
			sessionCookie, true )
		.then( ( decodedClaims ) => {
			console.info( 'Auth - verifySessionCookie success : ', decodedClaims );
			return true;
		} )
		.catch( error => {
			console.warn( 'Auth - verifySessionCookie false : ', error );
			return false;
		} );
		*/
};

exports.clearTempFile = async function ( timeSec = -100 ) {
	let returnJson = {
		success: false,
	}; //最終輸出


	try {
		const storage5t = new Storage( {
			keyFilename: envValues.cert,
			projectId: envValues.firebaseConfig.projectId
		} );

		let bucket1 = storage5t.bucket( envValues.firebaseConfig.storageBucket );



		//let buckeFile1 = bucket1.file( envValues.sharefilePath5T.concat( fileUploadId, '.', data.fileSubName ) );



		const options = {
			prefix: 'uploadTemp',
			delimiter: '/'
		};

		// Lists files in the bucket, filtered by a prefix
		const files = ( await bucket1.getFiles( options ) )[ 0 ];

		//console.log( 'Files:' );
		files.forEach( file => {
			//console.log( file.name );
			//file.getMetadata();
		} );




		//Metadata = ( await buckeFile1.getMetadata() )[ 0 ];



	} catch ( errorclearTempFile ) {
		console.warn( errorclearTempFile );
	}

}