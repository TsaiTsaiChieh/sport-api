const modules = require('../../util/modules');

function getTitlesAndSignature(args) {
  return new Promise(async function(resolve, reject) {
    /* step 1: check if user exists */
    try {
      const userDoc = await modules.getDoc('users', args.uid);
      const userSnapshot = await userDoc.get();
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      const user = userSnapshot.data();
      let titles = user.titles ? user.titles : [];
      resolve({
        uid: args.uid,
        signature: user.signature,
        titles: titles
      });
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getTitlesAndSignature;
