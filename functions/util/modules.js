const express = require('express');
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
const axios = require('axios');
const betsToken = envValues.betsToken;
// const Busboy = require('busboy');
const uuidv1 = require('uuid/v1'); // for unique id generation
const path = require('path');
const os = require('os');
const fs = require('fs');
const fileType = require('file-type');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const https = require('https');

ffmpeg.setFfmpegPath(ffmpegPath);

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(envValues.cert),
  databaseURL: envValues.firebaseConfig.databaseURL,
  storageBucket: envValues.firebaseConfig.storageBucket
});
const bucket = firebaseAdmin
  .storage()
  .bucket(envValues.firebaseConfig.storageBucket);
const firestore = firebaseAdmin.firestore();
const database = firebaseAdmin.database();
function getSnapshot(collection, id) {
  return firestore
    .collection(collection)
    .doc(id)
    .get();
}

function getDoc(collection, id) {
  return firestore.collection(collection).doc(id);
}

function addDataInCollection(collection, data) {
  return firestore.collection(collection).add(data);
}
function createError(code, error) {
  const err = {};
  err.code = code;
  err.error = error;
  return err;
}

// database name general setting
const db = {
  basketball_NBA: 'basketball_NBA',
  basketball_SBL: 'basketball_SBL'
};
function dateFormat(date) {
  return {
    year: date.substring(0, 4),
    month: date.substring(5, 7),
    day: date.substring(8, 10)
  };
}

module.exports = {
  express,
  firebaseAdmin,
  firebase,
  firestore,
  getSnapshot,
  createError,
  getDoc,
  ajv,
  bucket,
  database,
  addDataInCollection,
  moment,
  axios,
  db,
  betsToken,
  // Busboy,
  uuidv1,
  path,
  os,
  fs,
  fileType,
  ffmpeg,
  https,
  dateFormat
};
