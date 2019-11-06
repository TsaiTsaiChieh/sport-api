/* eslint-disable no-unreachable */
/* eslint-disable no-fallthrough */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const firebaseFunctions = require( 'firebase-functions' );
const ShortcutFunction = require( './shortcut_function' );
const envValues = require( './env_values' );
const users = require( './users' );
const htmlencode = require( 'js-htmlencode' );
const cookie = require( 'cookie' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const helmet = require( 'helmet' );
const app = express();
app.use( helmet() );
app.disable( 'x-powered-by' );
app.use( helmet.xssFilter() )
app.use( helmet.frameguard() )
app.use( bodyParser.urlencoded( {
	limit: '50mb',
	extended: false
} ) );
app.use( bodyParser.json( {
	limit: '50mb'
} ) );

app.use( express.json() );

//初始化資料庫
const firebaseAdmin = ShortcutFunction.lazyFirebaseAdmin( envValues.cert, "https://sport19y0715.firebaseio.com" ); //cert是路徑
const firestore = firebaseAdmin.firestore();

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
				return;
				//break;
		} //sw

		//let userData = ( await users.authVerfyGetUserData( req ) ).userData; //不一定有登入,要檢查uid

		//	userData=>{
		//		"success": true,
		//		"userData": {
		//			"email": "ina2588@gets-info.com",
		//			"displayName": "路人甲bnKcVVaiIaUf3daVMNTTK5gH4hf1",
		//			"headPictureUri": "data:image/png;base64,",
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
			.split( '/' ) //切割,注意 '//' 和第一個 '/' 造成空字串
			.filter( param => param.length > 0 ); //留下非空字串
		//returnJson.paramArray = paramArray;

		let param1 = ShortcutFunction.unEntityValueToDef( paramArray[ 0 ], '' );
		let param2 = ShortcutFunction.unEntityValueToDef( paramArray[ 1 ], '' );

		/*
		if ( param1.length < 1 && action2.length > 0 ) {
			returnJson.error = '參數錯誤,請檢查網址';
			res.status( 200 ).json( returnJson );
			return;
		}*/

		switch ( param1.toLowerCase() ) {

			case '': //空行為,回應建議vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				returnJson.error = '請下令操作行為:/list/last/create/report/delete/get/user';
				break;

			case 'list': //列出聊天室列表vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				returnJson.list = [];
				returnJson.list.push( 'public' );
				returnJson.success = true;
				break;

			case 'last': //最後N筆聊天訊息vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				returnJson = await lastMessages( req );
				//returnJson.success = true;
				//res.status( 200 ).json( returnJson );
				//return;
				break;

			case 'create': //新訊息,回應訊息vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				// @ts-ignore
				returnJson = await runCreateMessage( req );
				//res.status( 200 ).json( returnJson );
				//docRef.id
				break;

			case 'report': //檢舉vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				//console.info( 'run report );
				returnJson = await messageReport( req );
				//returnJson.success = true;
				//console.info( returnJson );
				//res.status( 200 ).json( returnJson );
				//return;
				break;

			case 'delete': //隱藏/回收/刪除訊息,
				returnJson = await softDeleteMessage( req ); //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				break;

			case 'get': ////取得特定訊息,只要一筆訊息
				returnJson = await getOneMessage( req );
				break;

			case 'user': //臨時用來取得登入者資料的//vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
				//console.info( '/user', req.body );
				returnJson = await getUserData( req );
				break;

				/*
				_schema
					if ( envValues.release ) {
						//營運時不顯示
						break;
					}*/

			default:
				//其他,直接返回403
				res.status( 403 ).send( '' );
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

async function getUserData( req ) {
	//返回一個用戶的公開資料
	let returnJson = {
		'success': false
	};

	try {

		let uid = req.body.uid || '';

		console.info( 'uid', uid );

		switch ( uid ) {
			case undefined:
			case null:
			case '':
				//後面處理
				break;

			default:
				//let collection = firestore.collection( 'users' )
				//		.where( 'uid', '==', uid );
				try {
					let doc = await firestore.collection( 'users' ).doc( uid ).get();

					if ( doc.exists ) {

						let data = doc.data();
						data.success = true;
						return returnJson;

					} else {
						returnJson.error = '該用戶不存在';
						return returnJson;
					}

				} catch ( error ) {
					returnJson.error = error;
					return returnJson;
				}

				break;
		}

		let loginUserData = await users.authVerfyGetUserData();
		uid = loginUserData.uid || '';
		if ( uid.length < 1 ) {
			returnJson.error = '沒有登入,無法取得個人公開資訊';
			return returnJson;
		}

		loginUserData.success = true;
		return loginUserData;

	} catch ( error ) {
		returnJson.error = error;
	}

	return returnJson;

}


//===============================================================================
//列表============================================================================
async function lastMessages( req ) {

	let returnJson = {
		success: false
	};

	try {
		console.info( 'run lastMessages' );

		//, utcJump = -1, limit = 50

		//req.query
		let limit = ShortcutFunction.ParseInt( req.body.limit, 50 ); //筆數預設值
		if ( limit > 200 ) {
			limit = 200; //筆數上限
		}
		if ( limit < 1 ) {
			limit = 1; //筆數下限
		}

		let utcJump = ShortcutFunction.ParseInt( req.body.utcJump, -1 ); //跳過訊息的時間位置

		let userData = await users.authVerfyGetUserData( req ); //不一定有登入,要檢查uid
		console.info( 'lastMessages userData=', userData );

		let userId = userData.uid || ''; //登入者id
		//if ( ShortcutFunction.haveEntityValue( userData.uid ) ) {
		//	userId = ShortcutFunction.trim( userData.uid );
		//}

		console.info( 'lastMessages limit=', limit );
		console.info( 'lastMessages utcJump=', utcJump );

		if ( !ShortcutFunction.haveEntityValue( req.body.channel ) ) {
			returnJson.error = "沒有輸入頻道(channel),至少輸入為public'";
			return returnJson;
		}

		let channel = ShortcutFunction.trim( req.body.channel );

		if ( channel.length < 1 ) {
			returnJson.error = '沒有輸入頻道(channel),至少輸入為public';
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

		let collection = firestore.collection( 'messages' )
			.where( 'channel', '==', channel ); //
		if ( utcJump > 0 ) {
			//跳過訊息的時間位置
			// @ts-ignore
			collection = collection.where( 'appearTimestamp', '<=', utcJump );
		}

		let Snapshot = await collection //
			.orderBy( 'appearTimestamp', 'desc' ) //
			.limit( limit + 50 ) //額外取得50筆紀錄,避免過濾後筆數不足
			.get();

		console.info( 'Snapshot.size=================', Snapshot.size );

		//let count = 0;
		let limit1 = limit - 1; //0~49=50;49=50-1;

		//let last_utc = -1;

		//console.info( 'lastMessages Snapshot.size=', Snapshot.size );

		//var messageArray = []; //返回的訊息陣列
		let returnArray = [];

		Snapshot.forEach(
			async function ( doc ) {
				let data = doc.data(); //每一筆訊息,(不能await)

				//console.info( 'lastMessages data', data );

				//last_utc = ShortcutFunction.setNoValue(data.appearTimestamp, last_utc);

				//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收),1用戶刪除(其他人可以看),無設定:正常顯示

				switch ( Number.parseInt( data.softDelete, 10 ) ) {
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

							data.headPictureUri = userData.headPictureUri;
							data.displayName = userData.displayName;

							delete data.softDelete; //去掉刪除狀態
							delete data.reports; //刪除被檢舉數量
							returnArray.push( data ); //真正要的訊息,放到陣列準備輸出.

							break;
				} //sw

				if ( returnArray.length >= limit1 ) {
					//如果取得筆數符合需求筆數數量.

					return true; //終止迴圈

				} //if limit1

			} //for func

		); //Snapshot for

		let userDataArray = []; // 臨時用戶資料表

		if ( userId.length > 0 ) {
			//userDataArray[ userId ] = userData; //把用戶自己加入臨時用戶表
		}

		//let FindUserJson = await dataArrayFindUserArray( returnArray, userDataArray );
		//returnArray = FindUserJson.dataArray;

		//console.info( 'lastMessages returnJson=======================', returnJson );

		returnJson.list = returnArray;

		//console.warn( 'lastMessages returnJson : 222222222222222222', returnJson );

		returnJson.success = true;

	} catch ( error ) {
		returnJson.error = error;
		console.warn( 'lastMessages error : ', error );
	}
	//return returnArray;
	return returnJson; //re
}



async function dataArrayFindUserArray( dataArray = [], userArray = [] ) {

	//let userDataArray = []; // 臨時用戶資料表

	console.info( 'dataArray   ', dataArray );

	let returnJson = {
		success: false
	}

	let array2 = [];

	let i = 0;

	try {

		for ( const data of dataArray ) {

			if ( userArray.indexOf( data.uid ) < 0 ) { //此訊息的作者資料不在陣列內

				let sw1 = await users.usersGetData( data.uid );
				console.info( 'sw1', sw1 );
				//	let sw2 = await sw1;

				userArray[ data.uid ] = sw1.userData;

			}

			data.displayName = userArray[ data.uid ].displayName;
			data.headPictureUri = userArray[ data.uid ].headPictureUri;

			array2.push( data ); //returnArray.push( data ); //真正要的訊息,放到陣列準備輸出.

			i++;
		} //for

		console.info( 'lastMessages returnArray.forEach array2 11111111111111111111111111111', array2 );

		returnJson.returnArray = array2;

		returnJson.success = true;
	} catch ( error ) {
		returnJson.error = error;
	}

	return returnJson;

}

async function getOneMessage( req ) {
	//只取一個訊息
	//userId = userId.toString();

	let returnJson = {
		success: false
	};


	try {
		console.info( 'getOneMessage' );

		//let body = req.body;

		let messageId = ShortcutFunction.trim( req.body.messageId || '' );

		/*
		if ( !ShortcutFunction.haveEntityValue( req.body.messageId ) ) {
			returnJson.error = '沒有訊息編號';
			console.info( 'getOneMessage 1111111111111', returnJson );
			return returnJson;

		}*/


		if ( messageId.length < 1 ) {
			returnJson.error = '沒有訊息編號';
			console.info( 'getOneMessage 2222222222222', returnJson );
			return returnJson;
		}

		let docSnapshot = await firestore
			.collection( 'messages' )
			.doc( messageId )
			.get();

		if ( !docSnapshot.exists ) {
			returnJson.error = '沒有此訊息';
			console.info( 'getOneMessage 3333333333333333', returnJson );
			return returnJson;
		}

		let data = docSnapshot.data();


		switch ( ShortcutFunction.ParseInt( data.softDelete, null ) ) {
			case -1: //管理員刪除(全域)
				returnJson.error = '沒有此訊息';
				console.info( 'getOneMessage 4444444444444', returnJson );
				return returnJson;
				//break;

			case 0: //用戶回收(全域刪除)
				returnJson.error = '沒有此訊息';
				console.info( 'getOneMessage 5555555555555555', returnJson );
				return returnJson;
				//break;

			case 1: //用戶刪除(對自己隱藏)
				var userData = await users.authVerfyGetUserData( req );

				if ( data.uid === userData.uid ) {
					//如果是隱藏自己的訊息,並且就是自己的訊息,就不要了.
					returnJson.error = '訊息已經刪除';
					console.info( 'getOneMessage 66666666666', returnJson );
					return returnJson;
				}
				break;

		}

		//取得訊息作者資料補進去
		let messageUser = await users.usersGetData( data.uid );

		console.info( 'getOneMessage messageUser 7777777777777777', messageUser );

		data.displayName = messageUser.displayName;
		data.headPictureUri = messageUser.headPictureUri;

		delete data.softDelete; //隱藏刪除狀態
		delete data.reports; //隱藏檢舉清單

		returnJson.list = data;
		returnJson.success = true;

	} catch ( error ) {
		returnJson.error = error;
	}

	//let cityRef = db.collection('cities').doc('SF');
	//let getDoc = cityRef.get()

	return returnJson;
}

//delete myobj.a;
//檢舉訊息=============================================================================
async function messageReport( req, messageId = '' ) { //, messageIdChecked = false

	let returnJson = {
		success: false
	};

	try {



		let userData = await users.authVerfyGetUserData( req );
		if ( !userData.success ) {
			return userData;
		}

		if ( !ShortcutFunction.haveEntityValue( userData.uid ) ) {
			return userData;
		}

		let disableTime = ShortcutFunction.ParseInt( userData.messageDisableTime, -1 ); //被禁止的期限
		if ( disableTime > -1 ) {
			let timeNow = ShortcutFunction.timestampUTCmsInt();
			if ( disableTime > timeNow ) {
				returnJson.error = '你已被停權中,無法使用檢舉功能';
				return returnJson;
			}
		}

		messageId = messageId || req.body.messageId || '';

		//messageId = ShortcutFunction.trim( messageId );


		if ( messageId.length < 1 ) {
			returnJson.error = '沒有訊息id';
			return returnJson;
		}

		let docSnapshot = await firestore.collection( 'messages' ).doc( messageId ).get();

		if ( !docSnapshot.exists ) {
			returnJson.error = '沒有此id的訊息';
			return returnJson;
		}

		//firestore.collection( 'messageReports' ).

		let DocRef = firestore.collection( 'messages' ).doc( messageId );

		let act = Number.parseInt( req.body.reportAction, 10 );

		returnJson.act = act;

		if ( act < 0 ) {

			let fvUn1 = firebaseAdmin.firestore.FieldValue.arrayRemove( userData.uid );

			let arrRm = await DocRef.update( {
				reports: fvUn1
			} );

			returnJson.writeTime = arrRm.writeTime;

			returnJson.success = true;

			return returnJson;
		}


		let fvAdd1 = firebaseAdmin.firestore.FieldValue.arrayUnion( userData.uid );
		let arrUnion = await DocRef.update( {
			reports: fvAdd1
		} );

		returnJson.writeTime = arrUnion.writeTime;
		returnJson.success = true;

	} catch ( error ) {
		console.warn( 'messageReport error', error );
		returnJson.error = error;
	}

	return returnJson;
}



//用戶刪除(自己隱藏)訊息
//用戶刪除訊息(全域回收)
//管理員刪除訊息(全域回收)
async function softDeleteMessage( req, messageId = '' ) { //, messageIdChecked = false

	let returnJson = {
		success: false
	};

	try {

		messageId = messageId || req.body.messageId || '';


		if ( messageId.length < 1 ) {
			returnJson.error = '沒有訊息id';
			return returnJson;
		}

		let docSnapshot = await firestore.collection( 'messages' ).doc( messageId ).get();

		if ( !docSnapshot.exists ) {
			returnJson.error = '沒有此id的訊息';
			return returnJson;
		}

		let data = docSnapshot.data();
		switch ( Number.parseInt( data.softDelete, 10 ) ) {
			case -1: //管理員刪除(全域)
			case 0: //用戶回收(全域刪除)
			case 1: //用戶刪除(對自己隱藏)
				returnJson.error = '沒有此id的訊息';
				return returnJson;
		} //sw

		////////////////////////////////////
		let userData = await users.authVerfyGetUserData( req );
		if ( !userData.success ) {
			return userData;
		}

		if ( !ShortcutFunction.haveEntityValue( userData.uid ) ) {
			return userData;
		}

		returnJson.messageId = data.uid;
		returnJson.uid = userData.uid;
		returnJson.displayName = userData.displayName;
		//returnJson.headPictureUri = userData.headPictureUri;
		returnJson.action = 'deleteMessage';
		returnJson.appearTimestamp = ShortcutFunction.timestampUTCmsInt(); //現在時間,utc,ms.

		if ( data.uid === userData.uid ) {

			let act = Number.parseInt( req.body.deleteAction, 10 );

			if ( act < 1 ) {
				let re = await docSnapshot.ref.update( {
					softDelete: 0
				} ); //, { merge: true }

				returnJson.deleteAction = 0;
				return ShortcutFunction.realtimePush( returnJson );

			} else {
				let re = await docSnapshot.ref.update( {
					softDelete: 1
				} ); //, { merge: true }

				returnJson.deleteAction = 1;
				//returnJson.success = true;
				return ShortcutFunction.realtimePush( returnJson );
			} //act


		} //uid==uid

		//Manager
		if ( Number.parseInt( userData.Manager, 10 ) > 0 ) {
			let re = await docSnapshot.ref.update( {
				softDelete: -1
			} ); //, { merge: true }
			returnJson.deleteAction = -1;
			//returnJson.success = true;
			return ShortcutFunction.realtimePush( returnJson );
		}

		returnJson.error = '你沒有權限刪除此訊息,請使用檢舉';

	} catch ( error ) {
		console.warn( 'messageReport error', error );
		returnJson.error = error;
	}

	return returnJson;
}
//新增,回應訊息(上傳檔案)============================================================
async function runCreateMessage( req ) {
	//, userData = {}
	//新訊息 //, re_hash, fi, ftype
	//let utc = firestore.ServerValue.TIMESTAMP;

	let returnJson = {
		success: false
	};

	console.info( 'runCreateMessage' );

	//return returnJson;

	try {
		let userData = await users.authVerfyGetUserData( req );

		if ( !userData.success ) {
			return userData;
		}

		if ( !ShortcutFunction.haveEntityValue( userData.uid ) ) {
			return userData;
		}

		if ( Number.isInteger( userData.blockMessage ) ) {
			let blackTime = ShortcutFunction.ParseInt( userData.blockMessage, -1 );
			if ( blackTime > 0 ) {
				let timeNow = ShortcutFunction.timestampUTCmsInt();
				if ( timeNow < blackTime ) { //還在禁言中
					returnJson.error = '用戶已經被禁止發言';
					return returnJson;
				}

			}

		}

		let messageContent = req.body;

		let messageLength = ShortcutFunction.trim( messageContent.message ).length;

		if ( messageLength + ShortcutFunction.trim( messageContent.file ).length < 1 ) {
			//沒有內文或是檔案
			returnJson.error = '沒有訊息內容或是檔案';
			return returnJson;
		}

		if ( ShortcutFunction.trim( messageContent.tempHash || '' ).length < 4 ) {
			returnJson.error = '沒有臨時hash';
			return returnJson
		}

		if ( ShortcutFunction.trim( messageContent.channel ).length < 1 ) {
			returnJson.error = '沒有channel';
			return returnJson
		}

		let newMessage = {
			uid: userData.uid,
			channel: messageContent.channel || 'public',
			//appearTimestamp: ShortcutFunction.timestampUTCmsInt(), //收到訊息的時間
			tempHash: messageContent.tempHash //發送端的臨時唯一編號
			//message: htmlencode.htmlEncode(messageContent.message) //訊息本體
		};

		//檢查夾帶檔案
		let fileInfo1 = ShortcutFunction.fileCheckAndReplace( messageContent.file, messageContent.fileType );
		if ( fileInfo1.fileSize > 0 ) {

			if ( !fileInfo1.success ) { //有夾帶檔案但報錯,終止並返回錯誤訊息
				return fileInfo1;
			}

			//如果有夾帶檔案且正常,先上傳並取回資訊
			let uploadFileReturnJson = await ShortcutFunction.runFileUpload( fileInfo1 );

			if ( uploadFileReturnJson.success ) { //上傳成功,將檔案資訊整合
				newMessage.fileUploadId = uploadFileReturnJson.fileUploadId || '';
				newMessage.fileName = htmlencode.htmlEncode( messageContent.fileName || '' );
				newMessage.fileType = uploadFileReturnJson.fileType || '';
				newMessage.fileSize = fileInfo1.fileSize;
				fileInfo1.uploadFileReturnJson = uploadFileReturnJson;
			} else {
				//returnJson.error = '夾帶檔案失敗:'.concat( uploadFileReturnJson.error );
				uploadFileReturnJson.fileInfo = fileInfo1;
				return uploadFileReturnJson;
			}

		}

		/*
		if ( fileInfo1.uploadFileReturnJson.success ) { //上傳成功,將檔案資訊整合
			newMessage.fileUploadId = fileInfo1.uploadFileReturnJson.docRef.id || '';
			newMessage.fileName = messageContent.fileName || '';
			newMessage.fileType = fileInfo1.uploadFileReturnJson.fileType || '';

		} else {
			//當沒有檔案也沒文字內容的訊息不要存入

			if ( messageLength < 1 ) {
				returnJson.error = '沒有訊息內容,也沒有夾帶檔案';
				return returnJson;
			} else {
				returnJson.error = '夾帶檔案失敗:'.concat( uploadFileReturnJson.error );
			} //if messageLength

		} //else uploadFileReturnJson
		*/

		//先到messages
		newMessage.message = htmlencode.htmlEncode( messageContent.message ); //訊息本體,需要編碼才能存入

		if ( ShortcutFunction.haveEntityValue( messageContent.replyMessageId ) ) { //回應文章編號
			newMessage.replyMessageId = messageContent.replyMessageId;
		}

		newMessage.appearTimestamp = ShortcutFunction.timestampUTCmsInt(); //現在時間,utc,ms.

		let docRef = await firestore.collection( 'messages' ).add( newMessage ); //docRef
		//docRef.id//此訊息的唯一編號

		if ( !ShortcutFunction.haveEntityValue( docRef.id ) ) {
			returnJson.error = 'firestore存檔失敗,沒有得到錯誤訊息,請檢查post資料整體大小是否超過10MB,或是任意key:value的大小超過1MB';
			return returnJson;
		}

		newMessage.messageId = docRef.id;
		returnJson.messageId = docRef.id;

		//returnJson.pushRefKey = pushRefKey;
		//returnJson.success = pushRefKey.length > 0;

		//再到realtime livePush
		newMessage.action = 'newMessage';
		newMessage.file = fileInfo1.fileContent;

		ShortcutFunction.realtimePush( newMessage );

		/*

			{
				action: 'newMessage',
				uid: userData.uid || '',
				messageId: docRef.id || '',
				appearTimestamp: newMessage.appearTimestamp || -1,
				displayName: userData.displayName || '',
				headPictureUri: userData.headPictureUri || '',

				//message: newMessage || ''
			}

				{
					action: 'newMessage',
					messageId: 'bnKcVVaiIaUf3daVMNTTK5gH4hf1',
					appearTimestamp: this.timestampUTCmsInt(),
					uid: 'bnKcVVaiIaUf3daVMNTTK5gH4hf1',
					displayName: '路人甲bnKcVVaiIaUf3daVMNTTK5gH4hf1',
					message: 'test2',
					headPictureUri: ''
				}
				*/

		/*
		let pushRefKey = await ShortcutFunction.realTimePushData( {
			action: 'newMessage',
			uid: userData.uid || '',
			displayName: userData.displayName || '這人居然沒有名子?',
			headPictureUri: userData.headPictureUri || '',
			appearTimestamp: newMessage.appearTimestamp,
			message: newMessage.message || '',
			replyMessageId: newMessage.replyMessageId || ''
		} );*/

		//let realTimeDB = firebaseAdmin.database();

		/*
		var push_ref = await admin
			.database()
			.ref('/message')
			.push(msg2);
		var push_ref_key = un2def(push_ref.key, '');*/

		newMessage.success = true;
		return newMessage;
	} catch ( error ) {
		console.warn( 'createMessage error', error );
		returnJson.error = error;
	}

	return returnJson;
}