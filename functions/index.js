/* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
const express = require("express");
// const sports = require('./sports');
// const messages = require('./messages');


const cors = require('cors');


const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(cors());
app.disable('x-powered-by');
const helmet = require('helmet');
app.use(helmet());

app.use(helmet.xssFilter());
app.use(helmet.frameguard());

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(express.json());

// app.use('/sports', sports);
// app.use('/messages', messages);
// app.use('/auth/test', require('./Authentication/auth'));
app.use('/auth', require('./router/authentication'));
app.use('/user', require('./router/user'));
//app.use('/test', require('./test'));
exports.api = functions.https.onRequest(app);