const functions = require('firebase-functions');
const myfunc = require('./myfunc');
const mycfg = require('./mycfg');
// const auth = require('./auth');

exports.sports = require('./sports');
exports.messages = require('./messages');
exports.auth = require('./auth');



// exports.index = functions.https.onRequest(
// 	async function (req, res) {
//
// 		try {
//
// 			//myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')
//
// 			//console.info(req);
//
// 			/*
// 			if (req.method === 'POST'){
// 			var cookies = req.get('cookie');
// 			if (cookies !== undefined) {
// 			var token = cookie.parse(cookies).__session;
// 			}
// 			}*/
//
// 			var arr = [];
// 			arr.push('<html><head><meta charset="utf-8" /><title>index text</title></head><body>');
//
// 			arr.push(myfunc.json2txt(req.params));
//
// 			arr.push(myfunc.json2txt(req.query));
//
// 			//
// 			//arr.push(crypto.getHashes());
//
// 			arr.push('""='.concat(myfunc.sha3_384('')));
//
//
// 			arr.push('base64test='.concat(myfunc.sha3_384(mycfg.base64test)));
//
// 			//arr.push(myfunc.json2txt(typeof (req)));
//
//
// 			/*
// 			for (var i in req) {
// 			try{
// 			arr.push( myfunc.json2txt( req[i] ) );
// 			} catch (e2) {
// 			//arr.push( myfunc.json2txt( e2.stack ) );
// 			}//try
// 			}
// 			*/
//
// 			arr.push('<form action="/index" method="POST" enctype="multipart/form-data" id="f01"><input type="text" id="txt01"><input type="submit"  value="送出"></form></body></html>');
//
// 			if (req.method === 'POST') {
// 				//有送參數的查詢
//
// 				//add/del/edit
// 			} else {
// 				//沒有查詢參數,直接給過去1天~未來2天的比賽清單
//
// 			}
//
//
// 			res.send(arr.join("\n")); //htmlencode.htmlEncode(  )
//
// 		} catch (e) {
//
// 			//var err=['catch : ',,e.name,e.message];
//
// 			res.send(e.stack); //err.join("\n")
//
//
// 			//res.send( req );//err.join("\n")
// 		}
// 	}
// );