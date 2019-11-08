/* eslint-disable no-unused-vars */
const functions = require( 'firebase-functions' );
const express = require( "express" );
const auth = require( './auth' );
const sports = require( './sports' );
const messages = require( './messages' );

const helmet = require( 'helmet' );
const cors = require( 'cors' );


const bodyParser = require( 'body-parser' );

const app = express();

app.use( cors() );
//app.use( helmet() );
app.disable( 'x-powered-by' );
//app.use( helmet.xssFilter() )
//app.use( helmet.frameguard() )

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