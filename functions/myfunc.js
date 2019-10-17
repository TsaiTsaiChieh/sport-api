
/*
範例,在exports的時候呼叫同檔案的函數,需加前綴this.
exports.ok=
function (inp){
return this.un2def(inp,'ok2');
}
*/

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fs= require('fs');

//const admin = require('firebase-admin');
//const functions = require('firebase-functions');

//admin.initializeApp(functions.config().firebase);

//const db = admin.firestore();

//用這個才不會把emoji編碼成亂碼
//const htmlencode = require('js-htmlencode');


exports.jcopy=
function (j){
	//序列化再反序列為物件//本質是複製
	return JSON.parse( JSON.stringify(j) );
}

exports.json2txt=
function (j){
	//json轉文字輸出,有格式化.
	return JSON.stringify(j,null,"\t");
}


exports.un2def=
function (src,def){

	if(src !== null && src !== undefined){
		return src;
	}
	return def;
}

exports.ck2ss=
function (req){
	//取得firebase傳遞的cookie/session , session指定變數名稱不能改
	var token=undefined;
	try{
		var cookies = req.get('cookie');

		token=cookie.parse(cookies).__session;
	} catch (e) {
		token= undefined;
	}
	return token;
}

exports.utf8lang=
function(res){
	//回應標頭設定utf-8 txt,與json輸出共用
	res.set('Content-Type', 'text/html; charset=utf-8');//plain
	res.set('content-language', 'zh-TW,zh');
	return res;
}


exports.fadmin=
function (fpath){

	//admin.initializeApp(functions.config().firebase);//on firebase

	if( fs.existsSync(fpath) ){
		//fpath目標存在
		admin.initializeApp( { credential: admin.credential.cert( require(fpath) ) } );//on local emu
	}else{
		//fpath目標不存在

		switch(fpath){

			case 'gcp':
			case 'GCP':
			admin.initializeApp( { credential: admin.credential.applicationDefault()	} );//on gcp
			break;

			default:
			admin.initializeApp(functions.config().firebase);//on firebase
			break;
		}
	}

	return admin;//.firestore();
}