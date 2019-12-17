const ssr = require('./server/index.js');

/* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(cors());
app.disable('x-powered-by');
const helmet = require('helmet');
app.use(helmet());

app.use(helmet.xssFilter());
app.use(helmet.frameguard());

app.use(
    bodyParser.urlencoded({
        limit: '50mb', extended: true
    })
);
app.use(
    bodyParser.json({
        limit: '50mb'
    })
);

app.use(express.json());

app.use('/auth', require('./router/authentication'));
app.use('/user', require('./router/user'));
app.use('/messages', require('./router/messages'));
app.use('/sport', require('./router/sport'));
app.use('/messages_temp', require('./Deprecated/messages'));
exports.api = functions.https.onRequest(app);

exports.ssr = functions.https.onRequest(ssr.app);
