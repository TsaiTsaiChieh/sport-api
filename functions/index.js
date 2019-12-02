/* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
const express = require("express");
const sports = require('./sports');
const messages = require('./messages');


const cors = require('cors');


const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(cors());
app.disable('x-powered-by');
const helmet = require('helmet');
//app.use( helmet() );

//app.use( helmet.xssFilter() )
//app.use( helmet.frameguard() )

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(express.json());

app.use('/sports', sports);
app.use('/messages', messages);
// app.use('/auth/test', require('./Authentication/auth'));
app.use('/auth/lineLoginHandler', require('./AuthController/line_handler'));
app.use('/auth/line_login', require('./AuthController/line_login'));
app.use('/auth/login', require('./AuthController/firebase_login'));
app.use('/auth/logout', require('./AuthController/logout'));
app.use('/auth/verifySessionCookie', require('./AuthController/verify_session_cookie'));
app.use('/user/modifyUserProfile', require('./UserController/modify_profile'));
app.use('/user/getUserProfile', require('./UserController/get_user_profile'));
//app.use('/test', require('./test'));
exports.api = functions.https.onRequest(app);