const envValues = require('../config/env_values');
const firebaseAdmin = require('firebase-admin');
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(envValues.cert),
    databaseURL: envValues.firebaseConfig.databaseURL
});

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

module.exports = {firebaseAdmin, firestore, getSnapshot, createError, getDoc};