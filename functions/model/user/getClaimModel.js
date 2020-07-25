const firebaseAdmin = require('../../util/firebaseUtil');

function getClaim(args) {
  return new Promise(async function(resolve, reject) {
    /* step 1: check user if exists */
    try {
      const firestore = firebaseAdmin().firestore();
      const userSnapshot = await firestore.collection('users').doc(args.uid).get();
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      const claim = await firebaseAdmin().auth().getUser(args.uid);
      resolve(claim.customClaims);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = getClaim;
