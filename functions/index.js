const functions = require('firebase-functions');
const myfunc=require('./myfunc');
const mycfg= require('./mycfg');
// const auth = require('./auth');

exports.sports = require('./sports');
exports.messages = require('./messages');
exports.auth = require('./auth');


exports.index = functions.https.onRequest(
	async function(request, response){

		try{

			//myfunc.utf8lang(response);//= response.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(request);

			/*
			if (request.method === 'POST'){
			var cookies = request.get('cookie');
			if (cookies !== undefined) {
			var token = cookie.parse(cookies).__session;
			}
			}*/

			var arr=[];
			arr.push('<html><head><meta charset="utf-8" /><title>sports api</title></head><body>');

			//arr.push( myfunc.json2txt( request.params ) );

			//arr.push( myfunc.json2txt( request.query ) );

			arr.push( myfunc.json2txt( typeof( request ) ) );


			/*
			for (var i in request) {
			try{
			arr.push( myfunc.json2txt( request[i] ) );
			} catch (e2) {
			//arr.push( myfunc.json2txt( e2.stack ) );
			}//try
			}
			*/


 
			arr.push('<form action="/sports" method="POST" enctype="multipart/form-data" id="f01"><input type="text" id="txt01"><input type="submit"  value="送出"></form></body></html>');

			if(request.method === 'POST') {
				//有送參數的查詢

				//add/del/edit
			}else{
				//沒有查詢參數,直接給過去1天~未來2天的比賽清單

			}


			response.send( arr.join( "\n" )  );//htmlencode.htmlEncode(  )

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			response.send( e.stack );//err.join("\n")


			//response.send( request );//err.join("\n")
		}
	}
);
