/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const admin = require( 'firebase-admin' );
const functions = require( 'firebase-functions' );
const ShortcutFunction = require( './shortcut_function' );
const env = require( './env_values' );


/*  原始
await firestore.collection( 'users' ).doc( userIdStr ).get()
	.then( doc => {
		if ( !doc.exists ) {
			console.log( 'No such document!' );
			returnJson.stats = 0;
			returnJson.success = true;
		} else {
			returnJson.data = doc.data();
			returnJson.stats = doc.data().stats;
			returnJson.success = true;
			// console.log('Document data:', doc.data());
		}
		console.log( 'getFirestoreUser : \n', ( JSON.stringify( returnJson, null, '\t' ) ) );
		return returnJson;
	} )
	.catch( err => {
		console.log( 'Error getting document', err );
		returnJson.success = false;
	} );
	*/

const cert = './auth/sport19y0715-d23e597f8c95.json';

let firestore;

async function useAwait( userIdStr = '' ) {



	let returnJson = {};

	firestore = ShortcutFunction.lazyFirebaseAdmin( cert ).firestore();

	let a = firestore.collection( 'users' ).doc( userIdStr ); //DocumentReference   (no )

	let b = a.get(); //Promise DocumentSnapshot (本質就是Promise, 前面await或是後面then , 才有DocumentSnapshot)

	let cDocumentSnapshot = await b; //在主線程拿到 DocumentSnapshot
	//c.ref.set({}});

	if ( cDocumentSnapshot.exists ) {
		//我在主線程做以下工作~~

		let d = cDocumentSnapshot.data(); //真的資料內容
		console.log( d );


	} else {

		//userIdStr並不存在

		//覆蓋性質的寫入,即使userIdStr存在也會都洗掉
		a.set( {
			key: 'value'
		} );

		//追加性質的寫入,只會複寫userIdStr內以下的key
		a.set( {
			key: 'new value'
		}, {
			merge: true
		} );

		//追加性質的寫入,只會複寫userIdStr內以下的key
		a.update( {
			key: 'new value'
		} );

	}



}


async function useThen( userIdStr = '' ) {

	try {
		let returnJson = {};

		let firestore = ShortcutFunction.lazyFirebaseAdmin( cert ).firestore();

		let a = firestore.collection( 'users' ).doc( userIdStr ); //DocumentReference

		let b = a.get(); //Promise DocumentSnapshot (本質就是Promise, 前面await或是後面then , 才有DocumentSnapshot)

		let userData = undefined;


		b.then( function ( cDocumentSnapshot2 ) {



			//我在子線程做其他工作

			if ( cDocumentSnapshot2.exists ) {

				let d2 = cDocumentSnapshot2.data(); //真的資料內容

				let seconds = 3;


				var waitTill = new Date( new Date().getTime() + seconds * 1000 );
				while ( waitTill > new Date() )

					//userData = d2;


					//userData = d2;

					console.log( 'in then', d2 );
			}


		} );

		console.log( 'main th', userData );

		var waitTill = new Date( new Date().getTime() + 10 * 1000 );
		while ( waitTill > new Date() );

		console.log( 'main th', userData );

	} catch ( error ) {
		console.error( error );
	}


}


function name1( params = '' ) {

	let firestore = ShortcutFunction.lazyFirebaseAdmin( cert ).firestore();

	let returnJson = {};

	//let test = firestore.collection( 'users' ).doc( 'userIdStr' );
	let test = firestore.collection( 'users' ).doc( 'userIdStr' );
	test.get().then( doc => {
			if ( !doc.exists ) {
				console.log( 'No such document!' );
				returnJson.stats = 0;
				returnJson.success = true;
			} else {
				returnJson.data = doc.data();
				returnJson.stats = doc.data().stats;
				returnJson.success = true;
				// console.log('Document data:', doc.data());
			}
			console.log( 'getFirestoreUser : \n', ( JSON.stringify( returnJson, null, '\t' ) ) );
			return returnJson;
		} )
		.catch( err => {
			console.log( 'Error getting document', err );
			returnJson.success = false;
		} );



}


async function name2( params = '' ) {

	let firestore = ShortcutFunction.lazyFirebaseAdmin( cert ).firestore();

	let returnJson = {};

	let test = firestore.collection( 'users' ).doc( 'userIdStr' );

	let test2 = test.get(); // Promise<DocumentSnapshot>

	let doc = await test2; //DocumentSnapshot

	if ( !doc.exists ) {
		console.log( 'No such document!' );
		returnJson.stats = 0;
		returnJson.success = true;
	} else {
		returnJson.data = doc.data();
		returnJson.stats = doc.data().stats;
		returnJson.success = true;
		// console.log('Document data:', doc.data());
	}
	console.log( 'getFirestoreUser : \n', ( JSON.stringify( returnJson, null, '\t' ) ) );
	return returnJson;

	/*
		.then( doc => {

			} )
			.catch( err => {
				console.log( 'Error getting document', err );
				returnJson.success = false;
			} );*/

}