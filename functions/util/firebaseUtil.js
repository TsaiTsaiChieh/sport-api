const envValues = require('../config/env_values');
const admin = require('firebase-admin');
module.exports = function() {
  if (admin.apps.length === 0) {
    console.log('initializing firebase database');
    return admin.initializeApp({
      credential: admin.credential.cert(envValues.cert),
      databaseURL: envValues.firebaseConfig.databaseURL,
      storageBucket: envValues.firebaseConfig.storageBucket
    });
  } else {
    console.log('firebase is already initialized');
    return admin;
  }
};
