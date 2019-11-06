const functions = require( 'firebase-functions' );
const express = require( "express" );
const auth = require( './auth' );
const sports = require( './sports' );
const messages = require( './messages' );


const bodyParser = require( 'body-parser' );

const app = express();
app.use( bodyParser.urlencoded( {
	limit: '50mb',
	extended: true
} ) );
app.use( bodyParser.json( {
	limit: '50mb'
} ) );

app.use( express.json() );

app.use( '/sports', sports );
app.use( '/messages', messages );
app.use( '/auth', auth );
//app.use('/test', require('./test'));
exports.api = functions.https.onRequest( app );