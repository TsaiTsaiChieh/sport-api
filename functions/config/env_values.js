exports.indexURL = 'https://chat-api.doinfo.cc/';
exports.productURL = 'https://chat.doinfo.cc/';
exports.release = false;
// 正式版 sport19y0715-dev
// exports.domain = '.doinfo.cc';
// exports.projectId = 'sport19y0715';
// exports.cert = require('../auth/sport19y0715-dev.json');
// exports.firebaseConfig = {
//   apiKey: 'AIzaSyB31V6WewUi-iY12231Ixahquf68uGaoCo',
//   authDomain: 'sport19y0715.firebaseapp.com',
//   databaseURL: 'https://sport19y0715.firebaseio.com',
//   projectId: 'sport19y0715',
//   storageBucket: 'sport19y0715.appspot.com',
//   messagingSenderId: '179049951227',
//   appId: '1:179049951227:web:15b2ae874d653216'
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
exports.domain = 'dosports.web.app';
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
  httpOnly: false,
  sameSite: 'none',
  secure: false,
  domain: this.domain
};

exports.lineConfig = {
  profileURL: 'https://api.line.me/v2/profile',
  tokenURL: 'https://api.line.me/oauth2/v2.1/token',
  verifyURL: 'https://api.line.me/oauth2/v2.1/verify',
  channelID: '1576253248',
  channelSecret: 'e4a91d4e33e26967fa6c267292bd06ec',
  callbackURL: this.indexURL + 'auth/lineLoginHandler'
};
exports.betsToken = require('../auth/betsToken.json').token;
exports.sportRadarKeys = require('../auth/sportRadarKeys.json');
