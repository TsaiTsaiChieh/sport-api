/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const firebaseFunctions = require( 'firebase-functions' );
const longsingShortcutFunction = require( './longsing_shortcuts/shortcut_function' );
const envValues = require( '././env_values' );
const users = require( './users' );
const htmlencode = require( 'js-htmlencode' );

//初始化資料庫
const firebaseAdmin = longsingShortcutFunction.lazyFirebaseAdmin( envValues.cert ); //cert是路徑
const firestore = firebaseAdmin.firestore();

const cookie = require( 'cookie' );

const express = require( 'express' );

const app = express();
app.use( express.json() );

//安全設定 //https://helmetjs.github.io/docs/
//https://expressjs.com/zh-tw/advanced/best-practice-security.htm
//const helmet = require('helmet');
//app.use(helmet());
//app.disable("x-powered-by");

/*

const cors = require("cors");

app.use(cors(
    //默認准許跨域請求,上線前按需去除
    {
        origin: true
    }));*/

/*
app.get('/:a', (req, res) => {
    res.status(200).send("post");
    res.status(200).json();
});
*/

async function getOneMessage( messageId = '' ) {
	//userId = userId.toString();
	messageId = messageId.toString();
	let doc = {};
	try {
		let docSnapshot = await firestore
			.collection( 'messages' )
			.doc( messageId )
			.get();

		if ( docSnapshot.exists ) {
			doc = this.setNoValue( docSnapshot.data(), {} );
		} else {
			doc.stack = 'no data';
		}
	} catch ( error ) {
		doc.stack = error.stacks;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()

	return doc;
}

async function listMessages( userData = {}, limit = 50, utcJump = -1 ) {
	//console.info('run listMessages');

	let returnArray = []; //返回的訊息陣列

	try {
		let userId = longsingShortcutFunction.unEntityValueToDef( userData.uid, '' ); //登入者id

		console.info( 'userId', userId );

		if ( Number.isInteger( limit ) ) {
			//筆數上限}
			if ( limit > 200 ) {
				limit = 200;
			}
		} else {
			limit = 50; //筆數預設值
		}

		if ( !Number.isInteger( utcJump ) ) {
			//跳過訊息的時間位置
			limit = -1;
		}

		//userId = longsingShortcutFunction.setNoValue(userId, '');
		//utcJump = longsingShortcutFunction.setNoValue(parseInt(utcJump, 10), -1); //這是訊息的日期時間(UTC格式),有值表示要定位/跳過取值,-1表示沒有跳過

		//limit = longsingShortcutFunction.setNoValue(parseInt(limit, 10), 50); //無法辨識則默認50筆,上限200//parseInt(來源, 10進制)

		//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收,大家全部不能看),1用戶刪除(自己不能看,其他人可以看),無設定/其他值:正常顯示
		//-1=管理員刪除 的訊息都不要
		//0=用戶回收 的訊息都不要

		//where:鏈接多個 where() 方法來創建更具體的查詢（邏輯 AND）。但是，要將等式運算符 (==) 與範圍運算符或 array-contains 子句（<、<=、>、>= 或 array-contains）結合使用，請務必創建復合索引
		//.where('hide_stat', '==', 0) // .where('hide_stat', '>', 1);//where難用,放棄,手動過濾

		let collection = firestore.collection( 'messages' ); //
		if ( utcJump > 0 ) {
			//跳過訊息的時間位置
			// @ts-ignore
			collection = collection.where( 'appear_timestamp', '<=', utcJump );
		}

		let Snapshot = await collection //
			.orderBy( 'appear_timestamp', 'desc' ) //
			.limit( limit + 50 ) //額外取得50筆紀錄,避免過濾後筆數不足
			.get();

		let userDataArray = []; // 臨時用戶資料表
		//await longsingShortcutFunction.firebaseSessionGetLoginUser(req);
		userDataArray[ userData.uid ] = userData; //把用戶自己加入臨時用戶表

		//let count = 0;
		let limit1 = limit - 1; //0~49=50;49=50-1;

		//let last_utc = -1;

		Snapshot.forEach(
			//async
			function ( doc ) {
				let data = doc.data(); //每一筆訊息,(不能await)

				//console.info('data', data);

				//last_utc = longsingShortcutFunction.setNoValue(data.appear_timestamp, last_utc);

				//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收),1用戶刪除(其他人可以看),無設定:正常顯示
				//let softDelete = ; //parseInt(來源, 10進制)
				switch ( parseInt( data.softDelete, 10 ) ) {
					case -1: //管理員刪除(全域)
					case 0: //用戶回收(全域刪除)
						//以上狀態的訊息都不要
						break;

					case 1: //用戶刪除(對自己隱藏)
						if ( data.uid === userId ) {
							//如果是隱藏自己的訊息,並且就是自己的訊息,就不要了.
							break;
						}

						//沒設定,正常顯示
						//case undefined:
						//case null:
						//case NaN:
						//case Infinity:
						default:
							//ex:999

							/*
							userDataArray = await users.GetUserDataToArray(data.uid, userDataArray);

							let messageUser = userDataArray[ data.uid ];
							*/

							data.displayName = ''; //longsingShortcutFunction.setNoValue(messageUser.displayName, '');
							data.headPictureUri = ''; //longsingShortcutFunction.setNoValue(messageUser.headPictureUri, ''); //;
							//data.color = ''; //longsingShortcutFunction.setNoValue(messageUser.color, ''); // ;

							data.softDelete = undefined; //去掉刪除狀態

							returnArray.push( data ); //真正要的訊息,放到陣列準備輸出.

							//count++; //有效筆數+1
							break;
				} //sw

				if ( returnArray.length >= limit1 ) {
					//如果取得筆數符合需求筆數數量.
					return true; //終止迴圈
				} //if i
			} //for func
		); //for

		//console.info('returnArray', returnArray);
	} catch ( error ) {
		console.warn( 'listMessages', error.stacks );
	}

	return returnArray; //re
}

async function createMessage( req = {}, userData = {} ) {
	//新訊息 //, re_hash, fi, ftype
	//let utc = firestore.ServerValue.TIMESTAMP;

	let returnJson = {
		success: false
	};

	try {
		if ( longsingShortcutFunction.setNoValue( userData.blockMessage, false ) ) {
			returnJson.message = 'block';
			return returnJson;
		}

		let messageContent = req.body;

		let messageLength = longsingShortcutFunction.trim( messageContent.message ).length;

		if ( messageLength + longsingShortcutFunction.trim( messageContent.file ).length < 1 ) {
			//沒有內文或是檔案
			returnJson.message = 'no content or file';
			return returnJson;
		}

		if ( longsingShortcutFunction.trim( messageContent.tempHash || '' ).length < 4 ) {
			returnJson.message = 'no temp hash';
			return returnJson;
		}

		let newMessage = {
			//appear_timestamp: longsingShortcutFunction.timestampUTCmsInt(), //收到訊息的時間
			tempHash: messageContent.tempHash //發送端的臨時唯一編號
			//message: htmlencode.htmlEncode(messageContent.message) //訊息本體
		};

		//如果有夾帶檔案
		let uploadFileReturnJson = await longsingShortcutFunction.runFileUpload( messageContent.file, messageContent.fileType );
		if ( uploadFileReturnJson.success ) {
			newMessage.fileUploadId = uploadFileReturnJson.docRef.id || '';
			newMessage.fileName = messageContent.fileName || '';
			newMessage.fileType = messageContent.fileType || '';
		} else {
			//當沒有檔案也沒文字內容的訊息不要存入
			if ( messageLength < 1 ) {
				returnJson.message = 'no content or file';
				return returnJson;
			} //if messageLength
		} //else uploadFileReturnJson

		//let newMessage = {
		//appear_timestamp: longsingShortcutFunction.timestampUTCmsInt(), //收到訊息的時間
		//	tempHash: messageContent.tempHash //發送端的臨時唯一編號
		//message: htmlencode.htmlEncode(messageContent.message) //訊息本體
		//};

		newMessage.appear_timestamp = longsingShortcutFunction.timestampUTCmsInt(); //現在時間,utc,ms.
		newMessage.message = htmlencode.htmlEncode( messageContent.message ); //訊息本體,需要編碼才能存入

		returnJson.docRef = await firestore.collection( 'messages' ).add( newMessage ); //docRef
		//docRef.id//此訊息的唯一編號
		if ( !longsingShortcutFunction.haveEntityValue( returnJson.docRef.id ) ) {
			returnJson.message = 'con not save message';
			return returnJson;
		}

		let pushRefKey = await longsingShortcutFunction.realTimePushData( {
			action: 'newMessage',
			message: newMessage.message,
			appear_timestamp: newMessage.appear_timestamp
		} );

		returnJson.pushRefKey = pushRefKey;

		returnJson.success = pushRefKey.length > 0;

		//let realTimeDB = firebaseAdmin.database();

		/*
		var push_ref = await admin
			.database()
			.ref('/message')
			.push(msg2);
		var push_ref_key = un2def(push_ref.key, '');*/

		//returnJson.success = true;
	} catch ( error ) {
		console.warn( 'createMessage', error );
		returnJson.stack = error;
	}

	return returnJson;
}

async function reportMessage( userId = '', messageId = '' ) {
	//檢舉訊息
}

async function softDeleteMessage( userId = '', messageId = '', deleteStat ) {
	//軟刪除訊息
}

app.all( '*', async ( req, res ) => {
	//'*' 可以用 '/:a/:b/**' 的方式匹配req.params.?變數,但在此不好用,自行切割解析

	let returnJson = {
		success: false
	}; //最終輸出

	try {
		//returnJson.method = req.method; //post,get;
		switch ( req.method ) {
			case 'GET':
				//break;
			case 'POST':
				break;

			default:
				//post,get以外的行為直接403
				res.status( 403 ).send( '' );
				//res.end();
				break;
		} //sw

		let userData = await users.firebaseSessionGetLoginUser( req );
		//userData.uid=''
		//userData.block=false

		//if (!longsingShortcutFunction.setNoValue(userData.block, false)) {
		//}

		//returnJson.params = req.params;
		//req.query=?...
		//req.headers

		let paramArray = req.params[ 0 ] //網址後面,實測已經有decodeURI(),不用再次decodeURI()
			.split( '/' ) //切割,注意 '//' 和第一個 '/' 造成空字串
			.filter( param => param.length > 0 ); //留下非空字串
		//returnJson.paramArray = paramArray;

		let param1 = longsingShortcutFunction.unEntityValueToDef( paramArray[ 0 ], '' );
		let param2 = longsingShortcutFunction.unEntityValueToDef( paramArray[ 1 ], '' );

		switch ( param1.toLowerCase() ) {
			//列表行為
			case '':
			case 'list':
				//msg_list();
				returnJson.results = await listMessages( userData ); //userId, limit, utcJump
				break;

			case 'create': //新訊息,回應訊息
			{
				let result = await createMessage( req );
			}

			//docRef.id
			break;

		case 'report': //檢舉
			break;

		case 'delete': //隱藏/回收/刪除訊息,
			break;

		case '_schema': //請求資料庫定義資訊
			if ( envValues.release ) {
				//營運時不顯示
				break;
			}

			default:
			//取得特定訊息
			{
				if ( param2.length > 0 && param1 !== '_schema' ) {
					//表示是要對此訊息作行為

					switch ( param2.toLowerCase() ) {
						case 'delete':
							break;

						case 'report':
							break;
					}
				}

				let doc = await getOneMessage( param1 );

				switch (
					doc.hide_stat //999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收),1用戶刪除(其他人可以看),無設定:正常顯示
				) {
					case -1:
						//returnJson.message = '訊息已經刪除';
						//break;
					case 0:
						returnJson.message = '訊息已經刪除';
						break;

					case 1:
						if ( doc.uid !== userData.uid ) {
							returnJson.results = doc;
						}

						break;

					default:
						returnJson.results = doc;
						break;
				} //sw
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
	//res.status(200)...

	//return next();

	//res.end();
} );

/*
app.post('*', (req, res) => {

	//console.log("api....");

	res.status(200).send(req.method); //"post"
	//res.status(200).json();

	//res.status.json({
	//   message: 'test ok'
	//});
	// return res.status(200);
	// res.status(200).send("hello");
});



app.get('*', (req, res) => {
	//console.log("api....");



	//res.status(200).json(arr_parm);

	//res.status.json({
	//   message: 'test ok'
	//});
	// return res.status(200);
	// res.status(200).send("hello");
});*/

module.exports = firebaseFunctions.https.onRequest( app );