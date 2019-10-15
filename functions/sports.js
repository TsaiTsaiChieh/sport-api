const functions = require('firebase-functions');
const myfunc=require('./myfunc');
const htmlencode = require('htmlencode');

module.exports = functions.https.onRequest( async (request, response) => {

		try{

			//myfunc.utf8lang(response);//= response.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(request.params);

			/*
			if (request.method === 'POST'){
				var cookies = request.get('cookie');
				if (cookies !== undefined) {
					var token = cookie.parse(cookies).__session;
				}
			}*/

			var arr=[];
			arr.push('<html><head><meta charset="utf-8" /><title>sports api</title></head><body>');

			arr.push( myfunc.json2txt( request.params ) );
			
			arr.push( myfunc.json2txt( request.query ) );
			
			arr.push( myfunc.json2txt( request.params ));// //request.body
			
			
			
			arr.push('<form action="12345" method="POST" enctype="multipart/form-data" id="f01"><input type="text" id="txt01"><input type="submit"  value="送出"></form></body></html>');

			/*
			switch(){
			case :
			break;

			default:
			break;
			}
			*/


			response.send( arr.join( "\n" )  );//htmlencode.htmlEncode(  )

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			response.send( e.stack );//err.join("\n")
		}

	}
	
);