const modules = require('../../util/modules');

function givePoints(args) {
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
      const userPoints = user.points ? user.points : 0;
      userDoc.update({ points: userPoints + args.points });
      resolve({
        uid: args.uid,
        currentPoints: userPoints + args.points
      });
    } catch (err) {
      console.log('error happened...', err);
      reject({ coder: 500, error: err });
    }
  });
}
module.exports = givePoints;
