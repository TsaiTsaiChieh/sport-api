const { firebaseAdmin, getDoc } = require('../../util/firebaseModules');

function setClaim(args) {
  return new Promise(async function(resolve, reject) {
    /* Step 1: check if user exists */
    try {
      const userDoc = await getDoc('users', args.uid);
      const userSnapshot = await userDoc.get();
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      firebaseAdmin
        .auth()
        .setCustomUserClaims(args.uid, { role: args.role });
      userDoc.update({ status: args.role });
      resolve({
        data: `set user: ${args.uid} as role: ${args.role} successfully`
      });
    } catch (err) {
      reject({ code: 500, error: err });
    }
  });
}

module.exports = setClaim;
