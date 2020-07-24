const { firebaseAdmin, getSnapshot } = require('../../util/firebaseModules');

function getClaim(args) {
  return new Promise(async function(resolve, reject) {
    /* step 1: check user if exists */
    try {
      const userSnapshot = await getSnapshot('users', args.uid);
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      const claim = await firebaseAdmin.auth().getUser(args.uid);
      resolve(claim.customClaims);
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = getClaim;
