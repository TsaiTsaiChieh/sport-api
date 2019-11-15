/* eslint-disable no-unreachable */
/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const firebaseFunctions = require( "firebase-functions" );
const ShortcutFunction = require( "./shortcut_function" );
const envValues = require( "./env_values" );
const users = require( "./users" );
const htmlencode = require( "js-htmlencode" );
const cookie = require( 'cookie' );
//const Buffer = require( "buffer" );

const express = require( "express" );
const app = express();
//const helmet = require( "helmet" );
//app.use( helmet() );
//app.disable( "x-powered-by" );
//app.use( helmet.xssFilter() );
//app.use( helmet.frameguard() );
const bodyParser = require( "body-parser" );
app.use(
	bodyParser.urlencoded( {
		limit: "50mb",
		extended: false
	} )
);
app.use(
	bodyParser.json( {
		limit: "50mb"
	} )
);

app.use( express.json() );

//初始化資料庫
const firebaseAdmin = ShortcutFunction.lazyFirebaseAdmin( envValues.cert, "https://sport19y0715.firebaseio.com" ); //cert是路徑
const firestore = firebaseAdmin.firestore();

/*
app.post( "*", async ( req, res ) => {

} );

app.get( "*", async ( req, res ) => {

} );*/

app.all( "*", async ( req, res ) => {
	//'*' 可以用 '/:a/:b/**' 的方式匹配req.params.?變數,但在此不好用,自行切割解析

	let returnJson = {
		success: false,
	}; //最終輸出

	try {
		//returnJson.method = req.method; //post,get;
		//let cookie__session = ShortcutFunction.cookieGet__session( req );
		//let body = req.body || {};
		let inputJson = {
			body: req.body || {},
			__session: '',
			idToken: {},
			method: req.method || 'req.method unknow'
		};

		try {
			inputJson.cookies = req.get( "cookie" );

			inputJson.__session = cookie.parse( inputJson.cookies ).__session || 'cookie.parse( cookies ).__session error'; //ShortcutFunction.cookieGet__session( req ) || 'cookieGet__session error';
		} catch ( error ) {
			inputJson.cookieERROR = error;
		}

		//inputJson;
		inputJson.idToken = await ShortcutFunction.__sessionToDecodedIdToken( inputJson.__session, firebaseAdmin ) || {};
		//{
		//	"success": true,
		//	"userData": {
		//		"email": "ina2588@gets-info.com",
		//		"displayName": "路人甲bnKcVVaiIaUf3daVMNTTK5gH4hf1",
		//		"avatar": "data:image/png;base64,",
		//		"uid": "bnKcVVaiIaUf3daVMNTTK5gH4hf1"
		//	}
		//}

		console.info( 'inputJson >>>>> ', inputJson );

		//res.json( inputJson );
		//return;

		switch ( req.method ) {
			case "GET":
				//break;
			case "POST":
				break;

			default:
				//post,get以外的行為直接403
				res.status( 403 ).send( "" );
				//res.end();
				return;
				//break;
		} //sw

		//let userData = ( await users.authVerfyGetUserData( req ) ).userData; //不一定有登入,要檢查uid

		//	userData=>{
		//		"success": true,
		//		"userData": {
		//			"email": "ina2588@gets-info.com",
		//			"displayName": "路人甲bnKcVVaiIaUf3daVMNTTK5gH4hf1",
		//			"avatar": "data:image/png;base64,",
		//			"uid": "bnKcVVaiIaUf3daVMNTTK5gH4hf1"
		//		}
		//	}

		//console.info( 'req.params :', req.params ); // /:act1/:act2
		//console.info( 'req.query :', req.body ); // all use
		//console.info( 'req.query :', req.query ); // all use
		//console.info( 'req.headers :', req.headers ); //no use

		//returnJson.params = req.params;
		//req.query=?...
		//req.headers

		let paramArray = req.params[ 0 ] //網址後面,實測已經有decodeURI(),不用再次decodeURI()
			.split( "/" ) //切割,注意 '//' 和第一個 '/' 造成空字串
			.filter( param => param.length > 0 ); //留下非空字串
		//returnJson.paramArray = paramArray;

		let param1 = ShortcutFunction.unEntityValueToDef( paramArray[ 0 ], "" );
		let param2 = ShortcutFunction.unEntityValueToDef( paramArray[ 1 ], "" );

		/*
		if ( param1.length < 1 && action2.length > 0 ) {
			returnJson.error = '參數錯誤,請檢查網址';
			res.status( 200 ).json( returnJson );
			return;
		}*/

		switch ( param1.toLowerCase() ) {

			case 'input':
				// @ts-ignore
				returnJson = inputJson;
				break;

			case "": //空行為,回應建議vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				returnJson.error = "請下令操作行為:/list/last/create/report/delete/get/user";
				break;

			case "list": //列出聊天室列表vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				returnJson.list = [];
				returnJson.list.push( "public" );
				returnJson.success = true;
				break;

			case "last": //最後N筆聊天訊息vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				returnJson = await lastMessages( inputJson );
				//returnJson.success = true;
				//res.status( 200 ).json( returnJson );
				//return;
				break;

			case "create": //新訊息,回應訊息vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				// @ts-ignore
				returnJson = await runCreateMessage( inputJson );
				//res.status( 200 ).json( returnJson );
				//docRef.id
				break;

			case "report": //檢舉vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				//console.info( 'run report );
				returnJson = await messageReport( inputJson );
				//returnJson.success = true;
				//console.info( returnJson );
				//res.status( 200 ).json( returnJson );
				//return;
				break;

			case "delete": //隱藏/回收/刪除訊息,
				returnJson = await softDeleteMessage( inputJson ); //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				break;

			case "get": ////取得特定訊息,只要一筆訊息
				// @ts-ignore
				returnJson = await ShortcutFunction.getOneMessage( inputJson );
				if ( returnJson.replyMessageId ) {
					returnJson.replyMessage = await ShortcutFunction.getOneMessage( undefined, returnJson.replyMessageId );
				}
				break;

			case 'file':
				try {
					let returnJson = await ShortcutFunction.getOneFile( inputJson, param2 );

					//var img = new Buffer( returnJson.file, 'base64' );

					//res.setHeader( 'Content-disposition', 'attachment; filename=dramaticpenguin.MOV' );
					//res.setHeader( 'Content-disposition', 'attachment; filename=01.jpg' );
					res.setHeader( 'Content-Type', 'image/jpeg' );
					//res.append(field)

					/*
					res.writeHead( 200, {
						'Content-disposition': 'attachment; filename=01.jpg',
						'Content-Type': 'image/jpeg',
						'Content-Length': returnJson.buffer.length
					} );
					*/

					//returnJson.buffer

					res.send( returnJson.buffer );
					//res.end(  );

					return;
				} catch ( error1 ) {
					console.warn( '/file', error1 );
					returnJson.error = error1;
				}

				break;

			case "user": //臨時用來取得登入者資料的//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				console.info( inputJson );
				try {
					let uid = inputJson.body.uid || inputJson.idToken.uid || '';
					returnJson.inputJson = inputJson;

					let returnJson2 = await users.userIdToUserData( uid );
					returnJson.success = true;
					returnJson2.history = returnJson;
					// @ts-ignore
					returnJson = returnJson2;
				} catch ( error1 ) {
					returnJson.error = error1;
				}

				break;

				/*
					_schema
						if ( envValues.release ) {
							//營運時不顯示
							break;
						}*/

			default:
				//其他,直接返回403
				res.status( 403 ).send( "" );
				return;
				//returnJson = await getOneMessage( req );
				//res.status( 200 ).json( returnJson );
				//return;
				break;
		} //sw

		//res.status(200).send('');//txt
		//res.status(200).json(returnJson);
		//returnJson.success = true;
	} catch ( error ) {
		console.warn( error.stack );
		//res.status(200).send(error.stack); //txt
		returnJson.error = error;
	}

	res.json( ShortcutFunction.clearJson( returnJson ) );
	//res.status(200)...

	//return next();

	//res.end();
} );

module.exports = firebaseFunctions.https.onRequest( app );




//===============================================================================
//列表============================================================================
async function lastMessages( inputJson ) {
	let returnJson = {
		success: false
	};

	try {
		console.info( "run lastMessages" );

		//, utcJump = -1, limit = 50

		//req.query
		let limit = Number.parseInt( inputJson.body.limit, 10 ) || 50; //筆數預設值
		if ( limit > 200 ) {
			limit = 200; //筆數上限
		}
		if ( limit < 1 ) {
			limit = 1; //筆數下限
		}

		let utcJump = ShortcutFunction.ParseInt( inputJson.body.utcJump, -1 ); //跳過訊息的時間位置

		//let userData = await users.authVerfyGetUserData( inputJson ); //不一定有登入,要檢查uid
		//console.info( "lastMessages userData=", userData );

		let userId = inputJson.idToken.uid || ''; //userData.uid || ""; //登入者id
		//if ( ShortcutFunction.haveEntityValue( userData.uid ) ) {
		//	userId = ShortcutFunction.trim( userData.uid );
		//}

		console.info( "lastMessages limit=", limit );
		console.info( "lastMessages utcJump=", utcJump );

		if ( !ShortcutFunction.haveEntityValue( inputJson.body.channel ) ) {
			returnJson.error = "沒有輸入頻道(channel),至少輸入為public'";
			return returnJson;
		}

		let channel = ShortcutFunction.trim( inputJson.body.channel );

		if ( channel.length < 1 ) {
			returnJson.error = "沒有輸入頻道(channel),至少輸入為public";
			return returnJson;
		}

		//userId = ShortcutFunction.setNoValue(userId, '');
		//utcJump = ShortcutFunction.setNoValue(parseInt(utcJump, 10), -1); //這是訊息的日期時間(UTC格式),有值表示要定位/跳過取值,-1表示沒有跳過

		//limit = ShortcutFunction.setNoValue(parseInt(limit, 10), 50); //無法辨識則默認50筆,上限200//parseInt(來源, 10進制)

		//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收,大家全部不能看),1用戶刪除(自己不能看,其他人可以看),無設定/其他值:正常顯示
		//-1=管理員刪除 的訊息都不要
		//0=用戶回收 的訊息都不要

		//where:鏈接多個 where() 方法來創建更具體的查詢（邏輯 AND）。但是，要將等式運算符 (==) 與範圍運算符或 array-contains 子句（<、<=、>、>= 或 array-contains）結合使用，請務必創建復合索引
		//.where('hide_stat', '==', 0) // .where('hide_stat', '>', 1);//where難用,放棄,手動過濾

		let collection = firestore.collection( "messages" ).where( "channel", "==", channel ); //
		if ( utcJump > 0 ) {
			//跳過訊息的時間位置
			// @ts-ignore
			collection = collection.where( "createTime", "<=", utcJump );
		}

		let Snapshot = await collection //
			.orderBy( "createTime", "desc" ) //
			.limit( limit + 50 ) //額外取得50筆紀錄,避免過濾後筆數不足
			.get();

		console.info( "Snapshot.size=================", Snapshot.size );

		//let count = 0;
		let limit1 = limit - 1; //0~49=50;49=50-1;

		//let last_utc = -1;

		//console.info( 'lastMessages Snapshot.size=', Snapshot.size );

		//var messageArray = []; //返回的訊息陣列
		let listArray = [];

		Snapshot.forEach(
			function ( doc ) {
				if ( listArray.length >= limit ) {
					//如果取得筆數符合需求筆數數量.
					console.info( "終止迴圈" );
					return true; //終止迴圈
				} //if limit1

				let data = doc.data(); //每一筆訊息,(不能await)

				console.info( "lastMessages doc >>>>>>>>>>>> ", doc );

				//last_utc = ShortcutFunction.setNoValue(data.createTime, last_utc);

				//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收),1用戶刪除(其他人可以看),無設定:正常顯示

				switch ( Number.parseInt( data.softDelete, 10 ) || 999 ) {
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
							delete data.softDelete; //去掉刪除狀態
							delete data.reports; //刪除被檢舉數量
							data.messageId = doc.id || doc.ref.id || '';


							listArray.push( data ); //真正要的訊息,放到陣列準備輸出.
							break;
				} //sw
			} //for func
		); //Snapshot for

		console.info( "lastMessages   listArray   1111111111", listArray );

		for ( const i in listArray ) {
			try {
				let msg1 = listArray[ i ];

				//取得訊息作者資料補進去
				let messageUser = await users.userIdToUserData( msg1.uid );

				msg1.avatar = messageUser.avatar || messageUser.avatar || '';
				msg1.avatar = msg1.avatar || "";
				msg1.displayName = messageUser.displayName || "";
				msg1.replyMessageId = msg1.replyMessageId || '';
				if ( msg1.replyMessageId.length > 0 ) {
					msg1.replyMessage = await ShortcutFunction.getOneMessage( undefined, msg1.replyMessageId );
				} else {
					msg1.replyMessage = {
						"success": false,
						"channel": "",
						"createTime": '',
						"message": "",
						"fileName": "",
						"tempHash": "",
						"fileUploadId": "",
						"fileType": "",
						"uid": "",
						"fileSize": 0,
						"messageId": "",
						"displayName": "",
						"avatar": "",
						"replyMessageId": "" //不會再往回查,只有回文Id

					}
				}

				msg1.channel = msg1.channel || '';
				msg1.createTime = msg1.createTime || '';
				msg1.message = msg1.message || '';
				msg1.fileName = msg1.fileName || '';
				msg1.tempHash = msg1.tempHash || '';
				msg1.fileUploadId = msg1.fileUploadId || '';
				msg1.fileType = msg1.fileType || '';
				msg1.uid = msg1.uid || '';
				msg1.fileSize = msg1.fileSize || '';
				msg1.messageId = msg1.messageId || '';
				//msg1.displayName = msg1.displayName
				//msg1.avatar = msg1.avatar
				msg1.replyMessageId = msg1.replyMessageId || '';


				listArray[ i ] = msg1;
			} catch ( errorForReturnArray ) {
				console.warn( "lastMessages errorForReturnArray", errorForReturnArray );
			}
		}

		console.info( "lastMessages   returnArray   2222222222222222", listArray );

		//let userDataArray = []; // 臨時用戶資料表

		if ( userId.length > 0 ) {
			//userDataArray[ userId ] = userData; //把用戶自己加入臨時用戶表
		}

		//let FindUserJson = await dataArrayFindUserArray( returnArray, userDataArray );
		//returnArray = FindUserJson.dataArray;

		//console.info( 'lastMessages returnJson=======================', returnJson );

		returnJson.list = listArray;

		//console.warn( 'lastMessages returnJson : 222222222222222222', returnJson );

		returnJson.success = true;
	} catch ( error ) {
		returnJson.error = error;
		console.warn( "lastMessages error : ", error );
	}
	//return returnArray;
	return returnJson; //re
}

//delete myobj.a;
//檢舉訊息=============================================================================
async function messageReport( inputJson, messageId = "" ) {
	//, messageIdChecked = false

	let returnJson = {
		success: false
	};

	try {
		if ( messageId.length < 1 ) {
			returnJson.error = "沒有訊息id";
			returnJson.inputJson = inputJson;
			return returnJson;
		}

		let uid = inputJson.idToken.uid || '';
		if ( uid === '' ) {
			returnJson.error = 'messageReport >>>> inputJson.idToken.uid不存在';
			returnJson.inputJson = inputJson;
			return returnJson;
		}

		let userData = await users.userIdToUserData( uid );
		uid = userData.uid || '';
		if ( !userData.uid ) {
			returnJson.error = 'messageReport  >>>>>  userData.uid不存在';
			returnJson.userData = userData;
			return returnJson;
		}

		let disableTime = Number.parseInt( userData.messageDisableTime, 10 ) || -1; //被禁止的期限
		if ( disableTime > -1 ) {
			let timeNow = ShortcutFunction.timestampUTCmsInt();
			if ( disableTime > timeNow ) {
				returnJson.error = "你已被停權中,無法使用檢舉功能";
				return returnJson;
			}
		}

		messageId = messageId || inputJson.body.messageId || "";

		console.info( " messageReport messageId", messageId );

		//messageId = ShortcutFunction.trim( messageId );


		let DocRef = firestore.collection( "messages" ).doc( messageId );

		let docSnapshot = await DocRef.get();

		let msgData = docSnapshot.data();

		if ( msgData === undefined ) {
			returnJson.error = "沒有此id的訊息";
			return returnJson;
		}

		//紀錄存在,檢查是否已經被軟刪除
		switch ( Number.parseInt( msgData.softDelete, 10 ) || 2 ) {
			case -1: //管理員刪除(全域)
				returnJson.error = "沒有此訊息";
				console.info( "messageReport 4444444444444", returnJson );
				return returnJson;
				//break;

			case 0: //用戶回收(全域刪除)
				returnJson.error = "沒有此訊息";
				console.info( "messageReport 5555555555555555", returnJson );
				return returnJson;
				//break;

			case 1: //用戶刪除(對自己隱藏)
				if ( msgData.uid === userData.uid ) {
					//如果是隱藏自己的訊息,並且就是自己的訊息,就不要了.
					returnJson.error = "沒有此訊息";
					console.info( "messageReport 66666666666", returnJson );
					return returnJson;
				}
				break;
		}

		//至此,沒有被軟刪除,己查檢舉者是否訊息作者

		if ( msgData.uid === uid ) { //訊息作者就是自己,
			returnJson.error = "你無法檢舉自己的訊息,但是你可以選擇刪除或是回收";
			console.info( "messageReport 777777777777", returnJson );
			return returnJson;
		}

		//至此,檢查檢舉還是取消檢舉

		let act = Number.parseInt( inputJson.body.reportAction, 10 ) || 1; //預設為檢舉

		returnJson.reportAction = act;

		if ( act < 0 ) { //取消檢舉
			let fvUn1 = firebaseAdmin.firestore.FieldValue.arrayRemove( userData.uid );

			let arrRm = await DocRef.update( {
				reports: fvUn1
			} );

			returnJson.writeTime = arrRm.writeTime;

			returnJson.success = true;

			return returnJson;
		}

		//檢舉
		let fvAdd1 = firebaseAdmin.firestore.FieldValue.arrayUnion( userData.uid );
		let arrUnion = await DocRef.update( {
			reports: fvAdd1
		} );

		returnJson.writeTime = arrUnion.writeTime;
		returnJson.success = true;
	} catch ( error ) {
		console.warn( "messageReport error", error );
		returnJson.error = error;
	}

	return returnJson;
}

//用戶刪除(自己隱藏)訊息
//用戶刪除訊息(全域回收)
//管理員刪除訊息(全域回收)
async function softDeleteMessage( inputJson, messageId = "" ) {
	//, messageIdChecked = false

	let returnJson = {
		success: false
	};

	try {
		messageId = messageId || inputJson.body.messageId || "";

		messageId = ShortcutFunction.trim( messageId );

		console.info( "softDeleteMessage messageId =============>", messageId );

		if ( messageId.length < 1 ) {
			returnJson.error = "沒有訊息id  1111";
			return returnJson;
		}

		let docSnapshot = await firestore
			.collection( "messages" )
			.doc( messageId )
			.get();

		let data = docSnapshot.data();

		if ( data === undefined ) {
			returnJson.error = "沒有此id的訊息   2222";
			return returnJson;
		}

		console.info( "data.softDelete 33333333333", data.softDelete );

		switch ( Number.parseInt( data.softDelete, 10 ) || 2 ) {
			case -1: //管理員刪除(全域)
			case 0: //用戶回收(全域刪除)
			case 1: //用戶刪除(對自己隱藏)
				returnJson.error = "沒有此id的訊息  3333";
				return returnJson;
		} //sw



		////////////////////////////////////
		/*
		let userData = await users.authVerfyGetUserData( inputJson );
		if ( !userData.success ) {
			return userData;
		}

		if ( !ShortcutFunction.haveEntityValue( userData.uid ) ) {
			return userData;
		}*/

		let act = Number.parseInt( inputJson.body.deleteAction, 10 ) || 2;

		switch ( act ) {
			case -1:
			case 0:
			case 1:
				//往下執行
				break;

			default:
				//攔截並顯示錯誤訊息
				returnJson.error = "deleteAction參數錯誤,有效值為-1:管理員/0:用戶回收(全域刪除)/1:用戶刪除(對自己隱藏)";
				returnJson.deleteAction = inputJson.body.deleteAction;
				return returnJson;
				break;
		}

		let userData = await users.userIdToUserData( inputJson.idToken.uid );

		returnJson.action = "deleteMessage";
		returnJson.messageId = data.uid || '';
		returnJson.uid = userData.uid || '';
		returnJson.displayName = userData.displayName || '';
		returnJson.avatar = userData.avatar;
		returnJson.appearTimestamp = ShortcutFunction.timestampUTCmsInt(); //現在時間,utc,ms.

		//Manager管理權限刪除
		if ( Number.parseInt( userData.Manager, 10 ) > 0 ) {
			if ( data.uid !== userData.uid ) {
				//不是本人訊息,用管理權限刪除
				let re = await docSnapshot.ref.update( {
					softDelete: -1
				} ); //, { merge: true }
				returnJson.uid = "manager";
				returnJson.displayName = "manager";
				returnJson.deleteAction = -1;
				returnJson.success = true;
				return await ShortcutFunction.realtimePush( returnJson );
			}
		}

		act = Number.parseInt( inputJson.body.deleteAction, 10 ) || 2;

		if ( data.uid === userData.uid ) {
			//自己的訊息
			if ( act === 0 ) {
				//0=用戶回收(全域刪除)
				let re = await docSnapshot.ref.update( {
					softDelete: 0
				} ); //, { merge: true }

				returnJson.deleteAction = 0;
				returnJson.success = true;

				return await ShortcutFunction.realtimePush( returnJson );
			}

			if ( act === 1 ) {
				//1=用戶刪除(對自己隱藏)
				let re = await docSnapshot.ref.update( {
					softDelete: 1
				} ); //, { merge: true }

				returnJson.deleteAction = 1;
				returnJson.success = true;
				return await ShortcutFunction.realtimePush( returnJson );
			} //act
		} //uid==uid

		returnJson.error = "你沒有權限刪除此訊息,請使用檢舉";
	} catch ( error ) {
		console.warn( "messageReport error", error );
		returnJson.error = error;
	}

	return returnJson;
}
//新增,回應訊息(上傳檔案)============================================================
async function runCreateMessage( inputJson ) {
	//, userData = {}
	//新訊息 //, re_hash, fi, ftype
	//let utc = firestore.ServerValue.TIMESTAMP;

	let returnJson = {
		success: false
	};

	console.info( "runCreateMessage" );

	//return returnJson;

	try {
		let body = inputJson.body;

		body.message = ShortcutFunction.trim( body.message || "" );

		body.file = ShortcutFunction.trim( body.file || "" );

		//let messageLength = body.message.length;

		if ( body.message.length + body.file.length < 1 ) {
			//沒有內文或是檔案
			returnJson.error = "沒有訊息內容或是檔案";
			return returnJson;
		}

		body.tempHash = ShortcutFunction.trim( body.tempHash || "" );

		if ( body.tempHash.length < 4 ) {
			returnJson.error = "沒有臨時hash";
			return returnJson;
		}

		body.channel = body.channel || "public";

		if ( ShortcutFunction.trim( body.channel ).length < 1 ) {
			returnJson.error = "沒有channel";
			return returnJson;
		}


		let uid = inputJson.idToken.uid || '';
		if ( uid === '' ) {
			returnJson.error = 'messageReport >>>> inputJson.idToken.uid不存在';
			returnJson.inputJson = inputJson;
			return returnJson;
		}

		let userData = await users.userIdToUserData( uid );
		uid = userData.uid || '';
		if ( !userData.uid ) {
			returnJson.error = 'messageReport  >>>>>  userData.uid不存在';
			returnJson.userData = userData;
			return returnJson;
		}

		//檢查是否黑名單中
		let blackTime = Number.parseInt( userData.blockMessage ) || -1;
		if ( blackTime > 0 ) {
			let timeNow = ShortcutFunction.timestampUTCmsInt();
			if ( timeNow < blackTime ) {
				//還在禁言中
				returnJson.error = "用戶已經被禁止使用聊天室功能";
				return returnJson;
			}
		}

		//至此,訊息本體,用戶身分功能都有效

		let newMessage = {
			uid: userData.uid,
			channel: body.channel,
			createTime: ShortcutFunction.timestampUTCmsInt(), //收到訊息的時間
			tempHash: body.tempHash, //發送端的臨時唯一編號
			message: '' //htmlencode.htmlEncode( body.message ), //訊息本體

		};

		body.replyMessageId = ShortcutFunction.trim( body.replyMessageId || "" );

		if ( body.replyMessageId.length > 0 ) {
			newMessage.replyMessageId = body.replyMessageId;
		}

		//檢查夾帶檔案
		let fileInfo1 = ShortcutFunction.fileCheckAndReplace( body.file, body.fileType );
		if ( fileInfo1.fileSize > 0 ) {
			//先判斷有檔案
			if ( !fileInfo1.success ) {
				//有夾帶檔案但報錯,終止並返回錯誤訊息
				return fileInfo1;
			}

			//fileInfo1;

			//如果有夾帶檔案且正常,先上傳並取回資訊
			let uploadFileReturnJson = await ShortcutFunction.runFileUpload( fileInfo1 );

			if ( !uploadFileReturnJson.success ) {
				uploadFileReturnJson.fileInfo = fileInfo1;
				return uploadFileReturnJson;
			}

			//上傳成功,將檔案資訊整合
			newMessage.fileUploadId = uploadFileReturnJson.fileUploadId || "errorFileUploadId";
			//newMessage.fileName = htmlencode.htmlEncode(body.fileName);
			newMessage.fileName = ShortcutFunction.trim( body.fileName || "unknow.txt" );
			newMessage.fileType = fileInfo1.fileType;
			newMessage.fileSize = fileInfo1.fileSize;

			fileInfo1.uploadFileReturnJson = uploadFileReturnJson;
		} //if fileSize > 0

		//先到messages
		newMessage.message = htmlencode.htmlEncode( body.message ); //訊息本體,需要編碼才能存入

		if ( ShortcutFunction.haveEntityValue( body.replyMessageId ) ) {
			//回應文章編號
			newMessage.replyMessageId = body.replyMessageId;
		}

		//newMessage.createTime = ShortcutFunction.timestampUTCmsInt(); //現在時間,utc,ms.

		for ( const key in newMessage ) {
			if ( key.toString().length > 1024 ) {
				returnJson.error = key.concat( "鍵長度超過1MB" );
				return returnJson;
			}

			if ( newMessage[ key ].toString().length > 1024 ) {
				returnJson.error = key.concat( "值長度超過1MB" );
				return returnJson;
			}
		}



		let docRef = await firestore.collection( "messages" ).add( newMessage ); //docRef
		//docRef.id//此訊息的唯一編號

		/*
		if (!ShortcutFunction.haveEntityValue(docRef.id)) {
			returnJson.error = "firestore存檔失敗,沒有得到錯誤訊息,請檢查post資料整體大小是否超過10MB,或是任意key:value的大小超過1MB";
			return returnJson;
		}
		*/

		let messageId = ShortcutFunction.trim( docRef.id || "" );

		if ( messageId.length < 1 ) {
			returnJson.error = "firestore存檔失敗,沒有得到messageId(docRef.id)";
			return returnJson;
		}
		docRef.update( {
			messageId: messageId
		} );



		newMessage.messageId = messageId;
		returnJson.messageId = messageId;

		//returnJson.pushRefKey = pushRefKey;
		//returnJson.success = pushRefKey.length > 0;

		//再到realtime livePush

		//let userData = await users.authVerfyGetUserData( req );

		newMessage.displayName = userData.displayName || "noname XD";
		newMessage.avatar = userData.avatar || userData.avatar || "";
		//newMessage.avatar = newMessage.avatar;

		newMessage.action = "newMessage";
		newMessage.file = fileInfo1.fileContent;


		newMessage.fileType = newMessage.fileType || '';
		newMessage.file = newMessage.file || '';
		newMessage.fileName = newMessage.fileName || '';

		//newMessage.messageId: '',
		//newMessage.displayName: '',
		newMessage.replyMessageId = newMessage.replyMessageId || '';

		return await ShortcutFunction.realtimePush( newMessage );
	} catch ( error ) {
		console.warn( "createMessage error", error );
		returnJson.error = error;
	}

	return returnJson;
}

/*
//用戶id取得個資==========================================================
async function userIdToUserData( uid = '', isNewAppend = false ) { //getUserData
	//返回一個用戶的公開資料
	let returnJson = {
		success: false,

	};

	try {

		returnJson.uid = uid.toString(); // ShortcutFunction.trim( uid );

		returnJson.displayName = '';

		returnJson.avatar = '';

		if ( returnJson.uid.length > 0 ) {
			//console.info( 'getUserData 查詢body本身有uid', inputJson.body );
			//當查詢本身有uid
			let doc = await firestore
				.collection( "users" )
				.doc( uid )
				.get();

			//console.info("doc >>>>>>>>", doc);

			let data = doc.data();


			if ( data !== undefined ) {
				data.success = true;
				data.functionName = 'userIdToUserData';
				data.error = '';
				return data;
			}

			//沒DATA
			if ( isNewAppend ) {
				//是新增模式
			}

		}

		//沒UID
		returnJson.error = '沒有輸入uid';


	} catch ( error ) {
		returnJson.error = error;
		console.error( 'userIdToUserData eeeeeeeeeeeerrrrrrrrrrrrrr', error );
	}

	return returnJson;
}
*/