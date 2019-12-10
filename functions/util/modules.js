const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  keyFilename: envValues.cert
});
const bucket = storage.bucket('sport19y0715.appspot.com');

const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, useDefaults: true });

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(envValues.cert),
  databaseURL: envValues.firebaseConfig.databaseURL,
  storageBucket: 'sport19y0715.appspot.com'
});
// let bucket = firebaseAdmin.storage().bucket('my-custom-bucket').storage;
// async function getFileFromStorage(fileName) {
//   let bucket;
//   try {
//     bucket = await firebaseAdmin
//       .storage()
//       .bucket('my-custom-bucket')
//       .getFiles(fileName);
//     console.log('在這', bucket);

//     return bucket;
//   } catch (error) {
//     console.log('錯誤 happen....', error);
//   }
// }

// let a = getFileFromStorage('1319352721_ff119049eb625324');
// console.log('test.....', a);
const firestore = firebaseAdmin.firestore();

function getSnapshot(collection, id) {
  // console.log(collection, id);
  return firestore
    .collection(collection)
    .doc(id)
    .get();
}

function getDoc(collection, id) {
  return firestore.collection(collection).doc(id);
}

function createError(code, error) {
  const err = {};
  err.code = code;
  err.error = error;
  return err;
}

module.exports = {
  firebaseAdmin,
  firestore,
  getSnapshot,
  createError,
  getDoc,
  ajv,
  bucket
};
