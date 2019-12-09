/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const functions = require('firebase-functions');
const envValues = require('./config/env_values');
const longsingShortcutFunction = require('./shortcut_function');
const longsingShortcutHash = require('./shortcut_hash');
const htmlencode = require('htmlencode');

module.exports = functions.https.onRequest(async (req, res) => {
  let stacks = [];

  try {
    //myfunc.utf8lang(res);//= res.set('Content-Type', 'text/plain; charset=utf-8');

    const firebaseGetAdmin = longsingShortcutFunction.lazyFirebaseAdmin(
      envValues.cert
    );
    const fsdb = firebaseGetAdmin.firestore();

    //let template = swig.compileFile( init.thisdir.concat('/html/index.html') );//'test_chat/html/index.html'
    //let j = {
    //};
    //j.prfx = init.prfx;
    //j.userId = '';
    //let output = template(j);

    let p_sports = fsdb.collection('sports'); //.get();

    //let citiesRef = db.collection('cities');

    let sn_sports = await p_sports.get();

    let txt = JSON.stringify(sn_sports);

    let arr = [];
    arr.push('ok'); //myfunc.ok();

    sn_sports.forEach(
      //這裡不能async
      function(doc) {
        //doc.data() 不能await

        //console.log(doc.id, '=>', doc.data().name);

        //arr.push( JSON.stringify(  doc.data(),null, "\t" ) );
        arr.push(longsingShortcutFunction.jsonFormatOut(doc.data()));

        //return true; //終止迴圈
      }
    );

    res.send(arr.join('\n'));
  } catch (e) {
    //let err=['catch : ',,e.name,e.message];

    res.send(e.stack); //err.join("\n")
  }

  //res.send('END');
});
