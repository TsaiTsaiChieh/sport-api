const envValues = require('../config/env_values');
const admin = require('firebase-admin');

module.exports = function() {
  if (admin.apps.length === 0) {
    console.log('initializing firebase database');
    const cert = require(process.env.certPath);
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
