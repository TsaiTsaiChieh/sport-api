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
  'http://127.0.0.1:5000',
  'http://localhost:8080',
  'http://localhost:8081',
  'https://dosports.web.app',
  'https://api-dosports.web.app'
];
const localOrigin = 'http://172.16.21';

const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else if (origin.includes(localOrigin)) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  }
};

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
};

app.use(cors(corsOptions));

app.use(express.json());
// app.use('/sqlinit', require('./sqlinit'));
app.use('/admin', require('./routers/admin'));
app.use('/auth', require('./routers/authentication'));
app.use('/user', require('./routers/user'));
app.use('/messages', require('./routers/messages'));
app.use('/sport', require('./routers/sport'));
// app.use('/messages_temp', require('./Deprecated/messages'));
// for test pubsub endpoint
app.use('/pubsub', require('./routers/pubsub'));
app.use('/home', require('./routers/home'));
app.use('/topics', require('./routers/topics'));
app.use('/livescore', require('./routers/livescore'));
app.use('/rank', require('./routers/rank'));
exports.prematch = functions.pubsub
  .schedule('0 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch'));
exports.prematch_esport = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch_esport'));
exports.handicap = functions.pubsub
  .schedule('0 */1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/handicap'));
exports.handicap_esport = functions.pubsub
  .schedule('0 */1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/handicap_esport'));
// exports.lineups = functions.pubsub
//   .schedule('*/10 * * * *')
//   .timeZone('Asia/Taipei')
//   .onRun(require('./pubsub/lineups'));
exports.lineups_MLB = functions.pubsub
  .schedule('0 */1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/lineups_MLB'));
// exports.pbp_MLB = functions.pubsub
//   .schedule('* * * * *')
//   .timeZone('Asia/Taipei')
//   .onRun(require('./pubsub/checkmatch_MLB'));
// exports.pbp_NBA = functions.pubsub
//   .schedule('* * * * *')
//   .timeZone('Asia/Taipei')
//   .onRun(require('./pubsub/checkmatch_NBA'));
exports.pbp_eSoccer = functions.runWith(runtimeOpts).pubsub
  .schedule('* * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_ESoccer'));

// keep firebase cloud function :API awake
app.get('/awakeAPI', (req, res) => {
  res.status(200).json({ test: 'awake' });
});

exports.api = functions.runWith(runtimeOpts).https.onRequest(app);
