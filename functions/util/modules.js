const express = require('express');
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const firebase = require('firebase');
const moment = require('moment');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
const axios = require('axios');
const betsToken = envValues.betsToken;
const Busboy = require('busboy');
const uuidv1 = require('uuid/v1'); // for unique id generation
const path = require('path');
const os = require('os');
const fs = require('fs');
const fileType = require('file-type');

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
  sport_18: 'sport_baseketball'
};

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
  Busboy,
  uuidv1,
  path,
  os,
  fs,
  fileType
};
