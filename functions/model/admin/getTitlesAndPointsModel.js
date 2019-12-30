const modules = require('../../util/modules');

function getTitlesAndPoints(args) {
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

      return resolve({
        uid: args.uid,
        points: user.points,
        titles: user.titles
      });
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = getTitlesAndPoints;
