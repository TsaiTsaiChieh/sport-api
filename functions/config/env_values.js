exports.indexURL = 'https://chat-api.doinfo.cc/';
exports.productURL = 'https://chat.doinfo.cc/';

exports.domain = '.doinfo.cc';
exports.release = false;

// sport19y0715-dev 為正式版
// exports.cert = require('../auth/sport19y0715-dev.json');
// sportslottery-test-adminsdk 為測試版
exports.cert = require('../auth/sportslottery-test-adminsdk.json');
// 正式版
// exports.firebaseConfig = {
//   apiKey: 'AIzaSyB31V6WewUi-iY12231Ixahquf68uGaoCo',
//   authDomain: 'sport19y0715.firebaseapp.com',
//   databaseURL: 'https://sport19y0715.firebaseio.com',
//   projectId: 'sport19y0715',
//   storageBucket: 'sport19y0715.appspot.com',
//   messagingSenderId: '179049951227',
//   appId: '1:179049951227:web:15b2ae874d653216'
// };
// 測試版
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
// 正式版
// exports.projectId = 'sport19y0715'; 
// 測試版
exports.projectId = 'sportslottery-test';

exports.sharefilePath5T = 'share_files/'; //目前聊天室的檔案(5T區域)放置的有效資料夾,前端則是放到'uploadTemp/'
//exports.base64test = 'data:image/png;base64,...';

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
