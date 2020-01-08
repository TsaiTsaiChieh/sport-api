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
  'http://localhost:5000',
  'http://localhost:8080'
];
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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

exports.scheduledFunction = functions.pubsub
  .schedule('*/10 * * * *')
  .onRun(require('./pubsub/updateTest'));
exports.scheduledSportEvent = functions.pubsub
  .schedule('*/10 * * * *')
  .onRun(require('./pubsub/updateUpcomingEvent'));
exports.api = functions.https.onRequest(app);
exports.ssr = functions.https.onRequest(ssr.app);
