// 正式站 getsports-gsi
// exports.apiURL = 'https://api-dot-getsports-gsi.uc.r.appspot.com/';
// exports.productURL = 'https://getsport.cc/';
// exports.cert = require('../auth/getsports-gsi-firebase-adminsdk.json');
// exports.firebaseConfig = {
//   apiKey: 'AIzaSyDkFcK7PGierF7zuMA1d-uT4gaHNPnhFjo',
//   authDomain: 'getsports-gsi.firebaseapp.com',
//   databaseURL: 'https://getsports-gsi.firebaseio.com',
//   projectId: 'getsports-gsi',
//   storageBucket: 'getsports-gsi.appspot.com',
//   messagingSenderId: '605990362975',
//   appId: '1:605990362975:web:6ce4a3172117dfc36ea0ea',
//   measurementId: 'G-KJ81TH7PPS'
// };
// exports.redisConfig = {
//   REDISHOST: process.env.REDISHOST || '10.170.59.179',
//   REDISPORT: process.env.REDISPORT || 6379
// };
// exports.corsList = [
//   'https://getsports.cc',
//   'https://getsport.cc',
//   'https://www.getsports.cc',
//   'https://www.getsport.cc',
//   'https://api-getsports.web.app/',
//   'https://getsports-gsi.uc.r.appspot.com'
// ];
// exports.runtimeOpts = {
//   timeoutSeconds: 300,
//   memory: '2GB'
// };
// ***以上正式站***

// 測試版 sportslottery-test-adminsdk
exports.apiURL = 'https://api-dosports.web.app/';
exports.productURL = 'https://dosports.web.app/';
exports.cert = require('../auth/sportslottery-test-adminsdk.json');
exports.firebaseConfig = {
  apiKey: 'AIzaSyByoBAdesDJHNpT-d31y08UYcOwt5KeaBE',
  authDomain: 'sportslottery-test.firebaseapp.com',
  databaseURL: 'https://sportslottery-test.firebaseio.com',
  projectId: 'sportslottery-test',
  storageBucket: 'sportslottery-test.appspot.com',
  messagingSenderId: '969081540385',
  appId: '1:969081540385:web:da08ff289d0bec4ca9b860',
  measurementId: 'G-WRP22SQG9M'
};

if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
  exports.redisConfig = {
    REDISHOST: process.env.REDISHOST,
    REDISPORT: process.env.REDISPORT
  };
} else {
  exports.redisConfig = {
    REDISHOST: 'localhost',
    REDISPORT: 6379
  };
}
exports.corsList = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:9528',
  'https://dosports.web.app',
  'https://api-dosports.web.app',
  'https://admin-dosports.web.app',
  'https://frontend-dot-sportslottery-test.appspot.com',
  'https://front.gets-info.com',
  'https://getsports.cc',
  'https://www.getsports.cc',
  'https://sportslottery-test.appspot.com',
  'http://getsport.gets-info.com/'
];
// 以上測式站

exports.cookieOptions = {
  maxAge: 60 * 60 * 24 * 7 * 1000,
  sameSite: 'None',
  httpOnly: true,
  secure: true
};

exports.lineConfig = {
  profileURL: 'https://api.line.me/v2/profile',
  tokenURL: 'https://api.line.me/oauth2/v2.1/token',
  verifyURL: 'https://api.line.me/oauth2/v2.1/verify',
  channelID: '1654287441',
  channelSecret: '3ae318ddf60243d9e932c6a7918b80f4',
  callbackURL: this.apiURL + 'auth/lineLoginHandler'
};
exports.betsToken = '46719-gZEnjYySo0cLKx';
exports.sportRadarKeys = require('../auth/sportRadarKeys.json');
exports.zone_tw = 'Asia/Taipei';
