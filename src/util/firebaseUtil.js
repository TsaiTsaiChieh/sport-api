const envValues = require('../config/env_values');
const admin = require('firebase-admin');
const cert = require('../auth/sportslottery-test-adminsdk.json');
module.exports = function() {
  if (admin.apps.length === 0) {
    console.log('initializing firebase database');
    return admin.initializeApp({
      credential: admin.credential.cert(cert),
      databaseURL: envValues.firebaseConfig.databaseURL,
      storageBucket: envValues.firebaseConfig.storageBucket
    });
  } else {
    // console.log('firebase is already initialized');
    return admin;
  }
};
