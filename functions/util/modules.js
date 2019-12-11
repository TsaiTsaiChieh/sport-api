const dotenv = require('dotenv').config();
const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(envValues.cert),
  databaseURL: envValues.firebaseConfig.databaseURL,
  // storageBucket: 'sport19y0715.appspot.com'
  storageBucket: process.env.storageBucket
});
const bucket = firebaseAdmin.storage().bucket(process.env.storageBucket);
// const bucket = firebaseAdmin.storage().bucket('sport19y0715.appspot.com');
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
module.exports = {
  dotenv,
  firebaseAdmin,
  firestore,
  getSnapshot,
  createError,
  getDoc,
  ajv,
  bucket,
  database,
  addDataInCollection
};
