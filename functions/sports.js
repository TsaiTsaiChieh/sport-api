const functions = require('firebase-functions');
const myfunc=require('./myfunc');
const mycfg= require('./mycfg');
const htmlencode = require('htmlencode');

module.exports = functions.https.onRequest(
	async function(req, res){

		var stacks=[];
		
				try{

			//myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8');


			const fadmin=myfunc.fadmin( myfunc.cert );
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


			res.send( arr.join( "\n" ) );

		} catch (e) {

			//var err=['catch : ',,e.name,e.message];

			res.send( e.stack );//err.join("\n")
		}
		
		


		//res.send('END');

	}

);