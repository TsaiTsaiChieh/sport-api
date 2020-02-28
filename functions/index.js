const ssr = require('./server/index.js');

/* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

let bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.disable('x-powered-by');
const helmet = require('helmet');
app.use(helmet());
app.use(helmet.xssFilter());

app.use(helmet.frameguard());

app.use(
  bodyParser.json({
    limit: '50mb',
    extended: true
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  next();
});

const whitelist = [
  'https://chat.doinfo.cc',
  'https://doinfo.cc',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://192.168.0.195:8080',
  'http://192.168.0.170:8080'
];
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    } else {
      console.log('Not allowed by CORS', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/admin', require('./router/admin'));
app.use('/auth', require('./router/authentication'));
app.use('/user', require('./router/user'));
app.use('/messages', require('./router/messages'));
app.use('/sport', require('./router/sport'));
app.use('/messages_temp', require('./Deprecated/messages'));

// for test pubsub endpoint
app.use('/radar/prematch', require('./pubsub/prematch'));
app.use('/radar/handicap', require('./pubsub/handicap'));
app.use('/radar/cron10Min', require('./pubsub/cron10Min'));

exports.cronPrematch = functions.pubsub
  .schedule('0 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch'));
exports.cronHandicap = functions.pubsub
  .schedule('0 */1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/handicap'));
exports.cron10Mins = functions.pubsub
  .schedule('*/10 * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/cron10Min'));

exports.api = functions.https.onRequest(app);
// exports.ssr = functions.https.onRequest(ssr.app);
