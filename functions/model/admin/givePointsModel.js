const { getDoc } = require('../../util/firebaseModules');

function givePoints(args) {
  return new Promise(async function(resolve, reject) {
    /* step 1: check if user exists */
    try {
      const userDoc = await getDoc('users', args.uid);
      const userSnapshot = await userDoc.get();
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      const user = userSnapshot.data();
      const userPoints = user.point ? user.point : 0;
      userDoc.update({ point: userPoints + args.points });
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
