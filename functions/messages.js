const functions = require('firebase-functions');
const myfunc=require('./myfunc');
const mycfg= require('./mycfg');
const htmlencode = require('htmlencode');


//公開聊天室訊息
module.exports = functions.https.onRequest(
	async function(req, res){

		var stacks=[];

		var uhash='';//登入後有值.

		var lm=50;//預設查詢筆數

		//var def_ex=50;//因為沒有 '!=' 'or' 查詢方法.

		try{

			//myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			//console.info(req.params);

			//cookie -> __session
			//var cookies = req.get('cookie');
			//if (cookies !== undefined) {
			//	var token = cookie.parse(cookies).__session;
			//}


			var re={
			};
			re.stat='error';//預設為警告,直到行為完成才OK

			var arr=[];

			const fadmin=myfunc.fadmin( mycfg.cert );
			const fsdb=fadmin.firestore();

			if (req.method === 'POST'){
				//訊息進階操作

				re.params=req.params;

				//var inp=myfunc.un2def(req.body,{});

			}else{
				//沒有操作,列出訊息,默認是最後50個訊息.

				//var citiesRef = db.collection('cities');//.get();
				//var query = citiesRef.where('capital', '==', true).get()
				//var lastThree = citiesRef.orderBy('name', 'desc').limit(3);

				/*
				var n=0;

				if(uhash !== ''){
				var c_myhide= fsdb.collection('messages')//
				//.where('stat', '==', 2)//
				.where('hide_stat', '==', uhash)//

				.orderBy('appear_timestamp', 'desc');//

				var
				}*/

				var c_msgs = fsdb.collection('messages')//.get();
				//where:鏈接多個 where() 方法來創建更具體的查詢（邏輯 AND）。但是，要將等式運算符 (==) 與範圍運算符或 array-contains 子句（<、<=、>、>= 或 array-contains）結合使用，請務必創建復合索引

				//軟刪除狀態,0正常顯示,1用戶刪除,1管理員刪除(回收),其他(uhash)只對用戶自己隱藏
				//-1=管理員刪除 的訊息都不要
				//1=用戶回收 的訊息都不要

				.where('hide_stat', '==', 0)//
				//.where('hide_stat', '>', 1);//

				c_msgs.orderBy('appear_timestamp', 'desc')//
				.limit(lm*2)//
				.get();//

				var sn_msgs = await c_msgs.get();

				//var txt=JSON.stringify(sn_msgs);

				var cnt=0;
				lm+=1;

				sn_msgs.forEach( //這裡不能async

					function(doc){

						if(cnt<lm){


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





							cnt++;
						}else{
							return true; //終止迴圈
						}

					});//for
					
				//arr.

				//res.send( arr.join( "\n" ) );

			}//else

			re.stat='ok';

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			//res.send( e.stack );//err.join("\n")

			stacks.push(e.stack);

		}

		re.messages=arr;

		if(! mycfg.release){
			re.stack=stacks;
		}

		res.send( re );//htmlencode.htmlEncode(  ) //myfunc.json2txt(  )

	}

);
