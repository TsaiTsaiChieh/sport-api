/* eslint-disable no-fallthrough */
const functions = require('firebase-functions');
const fauth = require('./mycfg');
const myfunc = require('./myfunc');
const mycfg = require('./mycfg');
//const htmlencode = require('htmlencode');

//初始化資料庫
const fadmin = myfunc.fadmin(mycfg.cert);
const fsdb = fadmin.firestore();

async function msg_list(uhash, lm, jutc) {

	//var re = {}; //回傳的json.


	//var stacks = [];

	var arr = [];
	//try {
	//	re.stat = 'warning'; //預設為警告,直到行為完成才OK

	uhash = uhash || ''; //myfunc.un2def(uhash, ''); //沒有hash就用'';
	lm = parseInt(lm, 10) || 50; //無法辨識則默認50筆;//parseInt(來源, 10進制)
	jutc = parseInt(jutc, 10) || -1; //這是訊息的日期時間(UTC格式),有值表示要定位/跳過取值,-1表示沒有跳過


	//var c_msgs = fsdb.collection('messages') //.get();
	//where:鏈接多個 where() 方法來創建更具體的查詢（邏輯 AND）。但是，要將等式運算符 (==) 與範圍運算符或 array-contains 子句（<、<=、>、>= 或 array-contains）結合使用，請務必創建復合索引

	//999:軟刪除狀態;-1:管理員刪除(回收),0用戶刪除(回收,大家全部不能看),1用戶刪除(自己不能看,其他人可以看),無設定/其他值:正常顯示
	//-1=管理員刪除 的訊息都不要
	//0=用戶回收 的訊息都不要

	//.where('hide_stat', '==', 0) // .where('hide_stat', '>', 1);//where難用,放棄,手動過濾


	//fsdb.collection('messages').orderBy('appear_timestamp', 'desc') //
	//	.limit(lm + 100) //額外取得100筆紀錄,避免過濾後筆數不足
	//	.get(); //

	var c_msgs = await fsdb.collection('messages'); //
	if (jutc > 0) {
		c_msgs = c_msgs.where('appear_timestamp', '<=', jutc);
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

function msg_new(uhash, msg, re_hash, fi, ftype) {

}

function msg_hide(uhash, msg_hash, stat) {

}


//公開聊天室訊息
module.exports = functions.https.onRequest(
	async function (req, res) {

		var stacks = [];

		var uhash = ''; //登入後有值.

		var lm = 50; //預設查詢筆數

		//var def_ex=50;//因為沒有 '!=' 'or' 查詢方法.

		var re = {}; //回傳的json.

		try {

			//myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(req.params);

			//cookie -> __session
			//var cookies = req.get('cookie');
			//if (cookies !== undefined) {
			//	var token = cookie.parse(cookies).__session;
			//}


			re.success = '0'; //預設為警告,直到行為完成才OK

			var results = [];

			if (req.method === 'POST') {
				//訊息進階操作

				re.params = req.params;

				//var inp=myfunc.un2def(req.body,{});

			} else {
				//沒有操作,列出訊息,默認是最後50個訊息.

				results = await msg_list(uhash, lm);

				//arr.

				//res.send( arr.join( "\n" ) );

			} //else

			re.stat = 'ok';

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			//res.send( e.stack );//err.join("\n")

			stacks.push(e.stack);

		}

		re.results = results;

		if (!mycfg.release && stacks.length > 0) {
			re.stack = stacks;
		}

		res.send(re); //htmlencode.htmlEncode(  ) //myfunc.json2txt(  )

	}

);