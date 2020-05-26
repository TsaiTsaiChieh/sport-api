exports.indexURL = 'https://getsports.cc/';
// exports.productURL = 'https://getsports.cc/';
exports.productURL = 'https://dosports.web.app/';
exports.release = false;
// 正式版 sport19y0715-dev
// exports.domain = '.doinfo.cc';
// exports.projectId = 'sport19y0715';
// exports.cert = require('../auth/sport19y0715-dev.json');
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
// exports.cookieOptions = {
//   maxAge: 60 * 60 * 24 * 7 * 1000,
//   httpOnly: true,
//   sameSite: 'none',
//   secure:true,
//   domain: '.doinfo.cc'
//   // domain: 'http://localhost:8080'
// };

// 測試版 sportslottery-test-adminsdk
exports.domain = '.web.app';
// exports.domain = 'localhost'; // by Tsai-Chieh，其他人可以不要打開這個註解
exports.projectId = 'sportslottery-test';
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
  channelID: '1576253248',
  channelSecret: 'e4a91d4e33e26967fa6c267292bd06ec',
  callbackURL: this.indexURL + 'auth/lineLoginHandler'
};
exports.betsToken = '35388-8IqMa0NK19LJVY';
exports.sportRadarKeys = require('../auth/sportRadarKeys.json');
exports.zone_tw = 'Asia/Taipei';
