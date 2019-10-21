const functions = require('firebase-functions');
const myfunc=require('./myfunc');
const htmlencode = require('htmlencode');


//公開聊天室訊息
module.exports = functions.https.onRequest(
	async function(req, res){

		try{

			//myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(req.params);


			if (req.method === 'POST'){
				//訊息進階操作
				
				//cookie -> __session
				//var cookies = req.get('cookie');
				//if (cookies !== undefined) {
				//	var token = cookie.parse(cookies).__session;
				//}
				
				
				var inp=myfunc.un2def(req.body,{});
				var 
				
				 
			}else{
				//沒有操作,列出訊息,默認是最後50個訊息.
			}

			var arr=[];
			arr.push('<html><head><meta charset="utf-8" /><title>sports api</title></head><body>');

			arr.push( myfunc.json2txt( req.params ) );

			arr.push( myfunc.json2txt( req.query ) );

			arr.push( myfunc.json2txt( req ));// //req.body

			arr.push('<form action="12345" method="POST" enctype="multipart/form-data" id="f01"><input type="text" id="txt01"><input type="submit"  value="送出"></form></body></html>');

			/*
			switch(){
			case :
			break;

			default:
			break;
			}
			*/


			res.send( arr.join( "\n" )  );//htmlencode.htmlEncode(  )

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			res.send( e.stack );//err.join("\n")
		}

	}

);
