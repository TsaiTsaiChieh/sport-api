const firebaseAdmin = require('firebase-admin');
const firestore = firebaseAdmin.firestore();

function getSnapshot(collection, id) {
  // console.log(collection, id);
  return firestore
    .collection(collection)
    .doc(id)
    .get();
}
module.exports = { firebaseAdmin, firestore, getSnapshot };
