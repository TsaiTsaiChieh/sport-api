const firebaseAdmin = require('firebase-admin');
const firestore = firebaseAdmin.firestore();

function getSnapshot(collection, id) {
  // console.log(collection, id);
  return firestore
    .collection(collection)
    .doc(id)
    .get();
}
function createError(code, error) {
  const err = {};
  err.code = code;
  err.error = error;
  return err;
}
module.exports = { firebaseAdmin, firestore, getSnapshot, createError };
