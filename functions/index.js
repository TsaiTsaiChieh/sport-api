const ssr = require('./server/index.js');

/* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.disable('x-powered-by');
const helmet = require('helmet');
app.use(helmet());
app.use(helmet.xssFilter());

app.use(helmet.frameguard());
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);

app.use(
  bodyParser.json({
    limit: '50mb'
  })
);
const whitelist = [
  'https://chat.doinfo.cc',
  'https://doinfo.cc',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://192.168.0.195:8080',
];
const corsOptions = {
    credential:true,
    origin: function(origin, callback) {
        console.log(',,,,,,,,,,');
        console.log(origin);
        if (whitelist.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/admin', require('./router/admin'));
app.use('/auth', require('./router/authentication'));
app.use('/user', require('./router/user'));
app.use('/messages', require('./router/messages'));
app.use('/sport', require('./router/sport'));
app.use('/messages_temp', require('./Deprecated/messages'));

exports.cronUpcoming = functions.pubsub
  .schedule('0 7 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/getUpcomingEvent'));
exports.cronHandicap = functions.pubsub
  .schedule('*/30 * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/getHandicap'));
exports.api = functions.https.onRequest(app);
exports.ssr = functions.https.onRequest(ssr.app);
