/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-fallthrough */
const functions = require('firebase-functions');

//const fstorge = require('firebase-firestore');


const myfunc = require('./myfunc');
const mycfg = require('./mycfg');
//const htmlencode = require('htmlencode');
const cookie = require('cookie');

//初始化資料庫
const fadmin = myfunc.fadmin(mycfg.cert);
const fsdb = fadmin.firestore();

const fs = require('fs');

//const bucket = fadmin.storage().bucket().upload());

//const firebase = require('firebase');
//const fauth = admin.auth();

//初始話儲存桶
//var b = await myfunc.gcsb('firebase_messages_files') || 'err';
//GCP桶不好用,暫時用fsdb存檔案

//fsdb單次上限10MB,單檔上限1MB,存檔先建立2種 散列hash 再切割.


async function fi_update(fi, ftype, life) { //把檔案上傳並且去重複,回傳上傳後的網址與hash
	var re = {
		'success': false
	};
	fi = fi || '';

	ftype = ftype || '';

	if (fi !== '') {

		var fhash = myfunc.sha3_384(fi);

		var l = fi.length;

		//Define bucket.
		//var bucket_def = gcs.bucket();

		//var c_fis =

		var sn_fis = await fsdb.collection('upload_files') //
			.where('fhash', '==', fhash) //
			.where('length', '==', fi.length) //
			//.orderBy('appear_timestamp', 'desc') //不須排序,加速
			//.limit(50) //不限制sha384重複的檔案數量.
			.get();

		var due = false;


		sn_fis.forEach( //這裡不能async

			function (doc) {
				var data = doc.data(); //每一筆檔案資訊,(不能await)
				if (data.content === fi) { //有重複sha384
					//due = true;





					//return true;
				}
			}
		); //for



	} else {
		re.stack = 'no file';
	}

	return re;
}



async function msg_list(uhash, lm, utc_jump) {


	//var re = {}; //回傳的json.


	//var stacks = [];

	var arr = [];
	//try {
	//	re.stat = 'warning'; //預設為警告,直到行為完成才OK

	uhash = uhash || ''; //myfunc.un2def(uhash, ''); //沒有hash就用'';
	lm = parseInt(lm, 10) || 50; //無法辨識則默認50筆;//parseInt(來源, 10進制)
	utc_jump = parseInt(utc_jump, 10) || -1; //這是訊息的日期時間(UTC格式),有值表示要定位/跳過取值,-1表示沒有跳過


	//var c_msgs = fsdb.collection('messages') //.get();
	//where:鏈接多個 where() 方法來創建更具體的查詢（邏輯 AND）。但是，要將等式運算符 (==) 與範圍運算符或 array-contains 子句（<、<=、>、>= 或 array-contains）結合使用，請務必創建復合索引

	//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收,大家全部不能看),1用戶刪除(自己不能看,其他人可以看),無設定/其他值:正常顯示
	//-1=管理員刪除 的訊息都不要
	//0=用戶回收 的訊息都不要

	//.where('hide_stat', '==', 0) // .where('hide_stat', '>', 1);//where難用,放棄,手動過濾


	//fsdb.collection('messages').orderBy('appear_timestamp', 'desc') //
	//	.limit(lm + 100) //額外取得100筆紀錄,避免過濾後筆數不足
	//	.get(); //

	var c_msgs = fsdb.collection('messages'); //
	if (utc_jump > 0) {
		c_msgs = c_msgs.where('appear_timestamp', '<=', utc_jump);
	}

	var sn_msgs = await c_msgs.orderBy('appear_timestamp', 'desc') //
		.limit(lm + 50) //額外取得50筆紀錄,避免過濾後筆數不足
		.get();

	//var txt=JSON.stringify(sn_msgs);

	var i = 0;
	var lm1 = lm - 1; //0~49=50;49=50-1;

	var last_utc = -1;

	sn_msgs.forEach( //這裡不能async

		function (doc) {

			var data = doc.data(); //每一筆訊息,(不能await)

			last_utc = data.appear_timestamp || last_utc || -1;

			//console.log(doc.id, '=>', doc.data().name);

			//arr.push( JSON.stringify(  doc.data(),null, "\t" ) );

			//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收),1用戶刪除(其他人可以看),無設定:正常顯示
			var i_hide_stat = parseInt(data.hide_stat, 10); //parseInt(來源, 10進制)
			switch (i_hide_stat) {

				case -1: //管理員刪除
				case 0: //用戶回收
					//以上狀態的訊息都不要
					break;

				case 1: //用戶刪除(對自己隱藏)
					if (data.uhash === uhash) { //如果是隱藏自己的訊息,剛好就是自己的訊息,就不要了.
						break;
					}
					//沒設定,正常顯示
					case undefined:
					case null:
					case NaN:
					default: //ex:999

						//arr.push( myfunc.json2txt( doc.data() ) );
						arr.push(data); //真正要的訊息,放到陣列準備輸出.
						i++; //有效筆數+1
						break;

			} //sw

			//return true; //終止迴圈

			if (i === lm1) { //如果取得筆數符合需求筆數數量.
				return true; //終止迴圈
			} //if i

		} //for func
	); //for

	//} catch (e) {
	//	re.stat = 'error';
	//	stacks.push(e.stack);
	//}


	//re.messages = arr;
	//re.stat = 'ok';

	return arr; //re

}



function msg_create(uhash, msg, re_hash, fi, ftype) {

}

function msg_del(uhash, msg_hash, stat) {

}


//公開聊天室訊息
module.exports = functions.https.onRequest(
	async function (req, res) {

		var stacks = [];

		var uhash = ''; //登入後有值.

		//var lm = 50; //預設查詢筆數

		//var def_ex=50;//因為沒有 '!=' 'or' 查詢方法.

		var re = {}; //回傳的json.

		try {

			//var [buckets] = await storage.getBuckets();
			//console.log('Buckets:');
			//buckets.forEach(bucket => {
			//	//	console.log(bucket.name);
			//	bucket.name
			//});
			//console.log(b);

			//re.bucket = await myfunc.gcsb('firebase_messages_files') || 'err';
			re.file = fs.readFileSync(mycfg.cert);


			//myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(req.params);

			//cookie -> __session
			var cookies = req.get('cookie');
			if (cookies !== undefined) {
				var token = cookie.parse(cookies).__session;
			}

			var ss = myfunc.ck2ss(req) || '';

			uhash = ss;

			re.success = false; //預設為false,直到行為完成才true

			var user = fadmin.auth().getUser(ss) || {};
			//var name, email, photoUrl, uid, emailVerified;
			//re.user = fadmin.auth().getUser() || {};
			/*
			if (user != null) {
				name = user.displayName;
				email = user.email;
				photoUrl = user.photoURL;
				emailVerified = user.emailVerified;
				uid = user.uid; // The user's ID, unique to the Firebase project. Do NOT use
				// this value to authenticate with your backend server, if
				// you have one. Use User.getToken() instead.
			}*/

			stacks.push({
				'user': user
			});

			//var results = [];

			if (req.method === 'POST') {
				//訊息進階操作

				//var r = req.params[0]; //{"0":"/messages/xxxx/yyyy"}
				var arr_r = req.params[0].split('/') || [];
				//0='messages'
				//1=xxxx
				//2=yyyy

				re.params = req.params || {};
				switch (arr_r[1] || '') {
					case 'create':
						break;

						//case 'edit':
						//	break;

					case 'del':

						break;

					default: //message_hash

						switch (arr_r[2] || '') {
							//case 'edit':
							//	break;

							case 'del':

								break;

							default:
								break;
						}

						break;
				}

				//var inp=myfunc.un2def(req.body,{});

			} else {
				//沒有操作,列出訊息,默認是最後50個訊息.

				re.results = await msg_list(user.uid);

				//arr.

				//res.send( arr.join( "\n" ) );

			} //else

			re.success = true;

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			//res.send( e.stack );//err.join("\n")

			console.error(e.stack);

			stacks.push(e.stack);

		}

		//re.results = results;

		//if (!mycfg.release && stacks.length > 0) {
		//	re.stack = stacks;
		//}
		re.stack = stacks;

		res.send(re); //htmlencode.htmlEncode(  ) //myfunc.json2txt(  )

	}

);