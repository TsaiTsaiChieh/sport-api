/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */

/*
範例,在exports的時候呼叫同檔案的函數,需加前綴this.
exports.ok=
function (inp){
return this.un2def(inp,'ok2');
}
*/

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const fs = require('fs');
const crypto = require("crypto");
const cookie = require('cookie');
//const htmlencode = require('js-htmlencode');
const moment = require('moment'); //https://www.npmjs.com/package/moment
const util = require("util");

const mycfg = require('./mycfg');

const farmhash = require('farmhash'); //https://www.npmjs.com/package/farmhash
const fnvp = require('fnv-plus'); //https://www.npmjs.com/package/@enonic/fnv-plus


const {
	Storage
} = require('@google-cloud/storage');

//Buffer.from('Emil')



//const admin = require('firebase-admin');
//const functions = require('firebase-functions');

//admin.initializeApp(functions.config().firebase);

//const db = admin.firestore();

//用這個才不會把emoji編碼成亂碼
//const htmlencode = require('js-htmlencode');


exports.jcopy =
	function (j) {
		//序列化再反序列為物件//本質是複製
		return JSON.parse(JSON.stringify(j));
	}

exports.json2txt =
	function (j) {
		//json轉文字輸出,有格式化.
		return JSON.stringify(j, null, "\t");
	}


exports.un2def =
	function (src, def) {

		if (src !== null && src !== undefined) {
			return src;
		}
		return def;
	}

exports.sha3_384 =
	function (data) {
		//crypto.getHashes()
		return crypto.createHash('sha3-384').update(data, 'binary').digest('hex'); //'hex'，'latin1'或者 'base64'
	}

exports.ck2ss =
	function (req) {
		//取得firebase傳遞的cookie/session , session指定變數名稱不能改
		var token = undefined;
		try {
			var cookies = req.get('cookie');

			token = cookie.parse(cookies).__session;
		} catch (e) {
			token = undefined;
		}
		return token;
	}

exports.utf8lang =
	function (res) {
		//回應標頭設定utf-8 txt,與json輸出共用
		res.set('Content-Type', 'text/html; charset=utf-8'); //plain
		res.set('content-language', 'zh-TW,zh');
		return res;
	}


exports.fadmin =
	function (fpath, databaseURL) {
		databaseURL = databaseURL || '';

		//admin.initializeApp(functions.config().firebase);//on firebase

		if (!admin.apps.length) { //表示尚未初始化

			var inf = {
				credential: admin.credential.cert(require(fpath))
			};

			if (databaseURL !== '') {
				inf.databaseURL = databaseURL;
			}

			if (fs.existsSync(fpath)) {

				//fpath目標存在
				admin.initializeApp(inf); //on local emu

			} else {
				//fpath目標不存在

				switch (fpath) {

					case 'gcp':
					case 'GCP':
						admin.initializeApp(inf); //on gcp
						break;

					default:
						admin.initializeApp(functions.config().firebase); //on firebase
						break;
				} //sw

			} //else
		} //if



		return admin; //.firestore();
	} //fadmin


exports.gcsb =
	async function (bucket_name, fpath) { //GCP拿儲存桶(證書路徑,桶名稱)

		// Creates a client
		var storage;

		if (fs.existsSync(fpath)) { //證書存在的初始
			storage = new Storage({
				'projectId': mycfg.projectId,
				'keyFilename': fpath
			});
		} else { //沒有證書的初始
			storage = new Storage();
		}

		var [buckets] = await storage.getBuckets(); //取得全部桶名稱
		//console.log('Buckets:');
		var b = false;

		//storage.bucket(bucket_name )

		buckets.forEach(bucket => {
			//	console.log(bucket.name);
			if (bucket.name === bucket_name) {
				b = true;
				return true;
			}

		});

		if (!b) { //沒有桶

			await storage.createBucket(bucket_name, {
				'location': 'us',
				'storageClass': 'multi_regional',
			});

			//await storage.createBucket(bucket_name);

		}

		return storage.bucket(bucket_name);

	} //gcsb





exports.send_json =
	function (res, json) {

		if (mycfg.release) {

			json.stack = [];
		}

		res.send(json);
	} //send_json


exports.hash_farm =
	function (str) {
		return farmhash.hash32(str);
	}

exports.hash_fnv1a =
	function (str) {
		return farmhash.hash32(str);
		//
	}