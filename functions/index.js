const functions = require('firebase-functions');
const myfunc=require('./myfunc');

exports.index = functions.https.onRequest( async (request, response) => {

		try{

			//myfunc.utf8lang(response);//= response.set('Content-Type', 'text/plain; charset=utf-8');


			const fadmin=myfunc.fadmin('./sport19y0715-d23e597f8c95.json');
			const fsdb=fadmin.firestore();

			//var template = swig.compileFile( init.thisdir.concat('/html/index.html') );//'test_chat/html/index.html'
			//var j = {
			//};
			//j.prfx = init.prfx;
			//j.userId = '';
			//var output = template(j);


			var p_sports=fsdb.collection('sports');//.get();

			//var citiesRef = db.collection('cities');

			var sn_sports = await p_sports.get();

			var txt=JSON.stringify(sn_sports);

			var arr=[];
			arr.push('ok');//myfunc.ok();


			sn_sports.forEach( //這裡不能async
				function(doc){
					//doc.data() 不能await

					//console.log(doc.id, '=>', doc.data().name);

					//arr.push( JSON.stringify(  doc.data(),null, "\t" ) );
					arr.push( myfunc.json2txt( doc.data() ) );

					//return true; //終止迴圈

				}
			);


			response.send( arr.join( "\n" ) );

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			response.send( e.stack );//err.join("\n")
		}


		//response.send('END');
	}
);

exports.sports = require('./sports');
/*
functions.https.onRequest( async (request, response) => {

		try{

			//myfunc.utf8lang(response);//= response.set('Content-Type', 'text/plain; charset=utf-8')+('content-language', 'zh-TW,zh')

			console.info(request.params);

			//response.send( '' );

			
			var arr=[];
			arr.push('ok');//myfunc.ok();
			arr.push( myfunc.json2txt( request.params ) );//myfunc.ok();


			response.send( arr.join( "\n" ) );
			

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			response.send( e.stack );//err.join("\n")
		}

	}
);
*/