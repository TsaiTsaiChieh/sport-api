const functions = require('firebase-functions');

const myfunc=require('./myfunc');

const htmlencode = require('htmlencode');


//公開聊天室訊息
module.exports = functions.https.onRequest(
	async function(request, response){

		try{

			//myfunc.utf8lang(response);//= response.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(request.params);

			//cookie -> __session
			//var cookies = request.get('cookie');
			//if (cookies !== undefined) {
			//	var token = cookie.parse(cookies).__session;
			//}


			var re={
			};
			re.stat='error';

			var arr=[];

			const fadmin=myfunc.fadmin('../../sport19y0715-d23e597f8c95.json');
			const fsdb=fadmin.firestore();

			if (request.method === 'POST'){
				//訊息進階操作

				re.params=request.params;

				//var inp=myfunc.un2def(request.body,{});

			}else{
				//沒有操作,列出訊息,默認是最後50個訊息.

				var p_sports=fsdb.collection('messages');//.get();

				var sn_sports = await p_sports.get();

				var txt=JSON.stringify(sn_sports);

				sn_sports.forEach( //這裡不能async
				
					function(doc){ 
					
						var data=doc.data();//每一筆訊息,(不能await)

						//console.log(doc.id, '=>', doc.data().name);

						//arr.push( JSON.stringify(  doc.data(),null, "\t" ) );
						
						switch(data.stat){

							//管理員刪除
							case -1:
							case '-1':

							//用戶回收
							case 1:
							case '1':

							//用戶刪除(對自己隱藏)
							case 2:
							case '2':
							//以上狀態的訊息都不要
							break;

							//沒設定,正常顯示
							case undefined:
							case null:
							default:
							
							//arr.push( myfunc.json2txt( doc.data() ) );
							
							break;
							
						}//sw

						arr.push( data );

						//return true; //終止迴圈

					});//for

				//arr.

				//response.send( arr.join( "\n" ) );

			}//else

			re.stat='ok';

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			//response.send( e.stack );//err.join("\n")

			
			re.stack=e.stack;

		}

		re.messages=arr;


		response.send( re  );//htmlencode.htmlEncode(  ) //myfunc.json2txt(  )


	}

);
