const modules = require('../../util/modules');
// const firebase = require('firebase');
function muted(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const userDoc = await modules.getDoc('users', args.uid);
      const userSnapshot = await userDoc.get();
      /* step1: check if user exists */
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      const user = userSnapshot.data();
      console.log(user.blockCount);

      if (!user.blockCount) {
        const expired = modules.moment().add(1, 'days');
        userDoc.set(
          {
            blockCount: 1,
            blockMessage: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date(expired)
            )
          },
          { merge: true }
        );
      } else if (Number.parseInt(user.blockCount) < 4) {
        let expired = 0;
        switch (user.blockCount) {
          case 1:
            expired = modules.moment().add(3, 'days');
            break;
          case 2:
            expired = modules.moment().add(7, 'days');
            break;
        }
        userDoc.set(
          {
            blockCount: user.blockCount + 1,
            blockMessage: modules.firebaseAdmin.firestore.Timestamp.fromDate(
              new Date(expired)
            )
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
    resolve(args);
  });
}

module.exports = muted;
