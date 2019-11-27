/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable prefer-arrow-callback */
const admin = require('firebase-admin');
const db = admin.firestore();

function getMessageWithKey(key) {
  return new Promise(function(resolve, reject) {
    db.collection('messages')
      .doc(key)
      .get()
      .then(function(snapshot) {
        resolve(snapshot.data());
      })
      .catch(function(err) {
        console.log(`getMessageWithKey error happened: ${err}`);
        reject(err);
      });
  });
}

module.exports = { getMessageWithKey };
