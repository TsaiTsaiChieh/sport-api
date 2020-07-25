const { moment } = require('../../util/modules');
const firebaseAdmin = require('../../util/firebaseUtil');

function muted(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const firestore = firebaseAdmin().firestore();
      const userDoc = await firestore.collection('users').doc(args.uid);
      const userSnapshot = await userDoc.get();
      /* step1: check if user exists */
      if (!userSnapshot.exists) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      /* step2: check if user is an admin or himself/herself */
      const user = userSnapshot.data();
      if (user.status === 9) {
        reject({
          code: 403,
          error: 'forbidden, admin cannot mute other admin or himself/herself'
        });
        return;
      }
      // blockCount default is 0, so this logic can combine
      if (!user.blockCount) {
        const expired = moment().add(1, 'days');
        userDoc.set(
          {
            blockCount: 1,
            blockMessage: firestore.Timestamp.fromDate(
              new Date(expired)
            )
          },
          { merge: true }
        );
      } else if (user.blockCount < 3) {
        let expired = 0;
        switch (user.blockCount) {
          case 1:
            expired = moment().add(3, 'days');
            break;
          case 2:
            expired = moment().add(7, 'days');
            break;
        }
        userDoc.set(
          {
            blockCount: user.blockCount + 1,
            blockMessage: firestore.Timestamp.fromDate(
              new Date(expired)
            )
          },
          { merge: true }
        );
      } else if (user.blockCount >= 3) {
        userDoc.set(
          {
            blockCount: user.blockCount + 1,
            blockMessage: firestore.Timestamp.fromDate(
              new Date(moment().add(100, 'years'))
            )
          },
          { merge: true }
        );
      }
      resolve({
        data: `Muted user: ${
          args.uid
        } successful, this user had been muted ${user.blockCount + 1} times`
      });
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = muted;
