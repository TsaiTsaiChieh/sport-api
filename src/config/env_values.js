exports.apiURL = process.env.apiURL;
exports.productURL = process.env.productURL;
exports.firebaseConfig = {
  apiKey: process.env.firebaseApiKey,
  authDomain: process.env.firebaseAuthDomain,
  databaseURL: process.env.firebaseDatabaseURL,
  projectId: process.env.GCLOUD_PROJECT,
  storageBucket: process.env.firebaseStorageBucket,
  messagingSenderId: process.env.firebaseMessagingSenderId,
  appId: process.env.firebaseAppId,
  measurementId: process.env.firebaseMeasurementId
};

exports.redisConfig = {
  REDISHOST: process.env.REDISHOST,
  REDISPORT: process.env.REDISPORT
};
exports.corsList = process.env.corsList.split(',');

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
