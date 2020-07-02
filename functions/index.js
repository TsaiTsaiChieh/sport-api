const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by');
app.use(cookieParser());
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

// 下面admin用
const adminapp = express();
adminapp.use(cookieParser());
adminapp.disable('x-powered-by');
adminapp.use(helmet());
adminapp.use(helmet.xssFilter());
adminapp.use(helmet.frameguard());
adminapp.use(
  bodyParser.json({
    limit: '50mb',
    extended: true
  })
);
adminapp.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);
adminapp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  next();
});
// 上面admin用

const whitelist = [
  'https://chat.doinfo.cc',
  'https://doinfo.cc',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:9528',
  'https://dosports.web.app',
  'https://api-dosports.web.app',
  'https://admin-dosports.web.app',
  'https://getsports.cc',
  'https://getsport.cc',
  'https://api-getsports.web.app/'
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
  memory: '2GB'
};

app.use(cors(corsOptions));
adminapp.use(cors(corsOptions));

app.use(express.json());
adminapp.use(express.json());
adminapp.use('/admin', require('./routers/admin'));
// app.use('/sqlinit', require('./sqlinit'));
app.use('/auth', require('./routers/authentication'));
app.use('/user', require('./routers/user'));
app.use('/messages', require('./routers/messages'));
app.use('/sport', require('./routers/sport'));
// app.use('/messages_temp', require('./Deprecated/messages'));
// for test pubsub endpoint
app.use('/pubsub', require('./routers/pubsub'));
app.use('/home', require('./routers/home'));
app.use('/topics', require('./routers/topics'));
app.use('/general', require('./routers/general'));
app.use('/livescore', require('./routers/livescore'));
app.use('/history', require('./routers/history'));
app.use('/rank', require('./routers/rank'));
app.use('/cashflow', require('./routers/cashflow'));
// app.use('/cashflow_gash', require('./routers/cashflow_gash'));//金流介接(gash)
app.use('/cashflow_neweb', require('./routers/cashflow_neweb')); // 金流介接(藍新)
// keep firebase cloud function :API awake
app.get('/awakeAPI', (req, res) => {
  res.status(200).json({ test: 'awake0528v01' });
});

// API cloud function
exports.api = functions.runWith(runtimeOpts).https.onRequest(app);
// admin cloud function
exports.admin = functions.runWith(runtimeOpts).https.onRequest(adminapp);

// 此排程再購買API後必須停掉
exports.forpastevent = functions.pubsub
  .schedule('0 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/forpastevent'));
// 各聯盟API排程
exports.prematch = functions.pubsub
  .schedule('0 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch'));
exports.prematch_esport = functions.pubsub
  .schedule('0 */1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch_esport'));
exports.handicap = functions.pubsub
  .schedule('0 */1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/handicap'));
exports.handicap_esport = functions.pubsub
  .schedule('*/30 * * * *')
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
exports.pbp_eSoccer = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_eSoccer'));
exports.pbp_KBO = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_KBO'));
exports.pbp_abnormal = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('*/10 * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_abnormal'));

exports.auth_statscore = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/auth_statscore'));
exports.prematch_statscore_KBO = functions.pubsub
  .schedule('5 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch_statscore_KBO'));
exports.pbp_statscore_KBO = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_statscore_KBO'));
exports.prematch_statscore_NPB = functions.pubsub
  .schedule('5 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch_statscore_NPB'));
exports.pbp_statscore_NPB = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_statscore_NPB'));
exports.prematch_statscore_CPBL = functions.pubsub
  .schedule('5 5 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/prematch_statscore_CPBL'));
exports.pbp_statscore_CPBL = functions
  .runWith(runtimeOpts)
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/checkmatch_statscore_CPBL'));
// 大神
exports.god = functions.pubsub
  .schedule('0 1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/god'));

// 金流
exports.god = functions.pubsub
  .schedule('0 1 * * *')
  .timeZone('Asia/Taipei')
  .onRun(require('./pubsub/cashflow'));
