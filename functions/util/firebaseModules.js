const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');

if (firebaseAdmin.apps.length === 0) {
  console.log('initializing firebase database');
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(envValues.cert),
    databaseURL: envValues.firebaseConfig.databaseURL,
    storageBucket: envValues.firebaseConfig.storageBucket
  });
} else {
  console.log('firebase is already initialized');
}

const bucket = firebaseAdmin
  .storage()
  .bucket(envValues.firebaseConfig.storageBucket);
const firestore = firebaseAdmin.firestore();
const database = firebaseAdmin.database();

function firebaseTimestamp(milliseconds) {
  return firebaseAdmin.firestore.Timestamp.fromDate(new Date(milliseconds));
}

async function cloneFirestore(name, clonedName) {
  const snapshot = await firestore.collection(name).get();
  const clonedDb = firestore.collection(clonedName);
  snapshot.docs.map(function(doc) {
    clonedDb.doc(doc.data().bets_id).set(doc.data(), { merge: true });
  });
}

function getSnapshot(collection, id) {
  return firestore.collection(collection).doc(id).get();
}

function getDoc(collection, id) {
  return firestore.collection(collection).doc(id);
}

function addDataInCollection(collection, data) {
  return firestore.collection(collection).add(data);
}
function addDataInCollectionWithId(collection, id, data) {
  return firestore.collection(collection).doc(id).set(data, { merge: true });
}

module.exports = {
  firebaseAdmin,
  firebaseTimestamp,
  bucket,
  firestore,
  database,
  cloneFirestore,
  getSnapshot,
  getDoc,
  addDataInCollection,
  addDataInCollectionWithId
};
