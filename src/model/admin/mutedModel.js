const { moment } = require('../../util/modules');
const { User } = require('../../util/dbUtil');
function muted(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const userDoc = await User.findOne({
        attributes: [
          'uid',
          'display_name',
          'status',
          'email',
          'block_count',
          'block_message'
        ],
        where: {
          uid: args.uid
        },
        raw: true
      });
      /* step1: check if user exists */
      if (!userDoc) {
        reject({ code: 404, error: 'user not found' });
        return;
      }
      /* step2: check if user is an admin or himself/herself */
      if (userDoc.status === 9) {
        reject({
          code: 403,
          error: 'forbidden, admin cannot mute other admin or himself/herself'
        });
        return;
      }
      let expired = moment().add(100, 'years');
      switch (userDoc.block_count) {
        case 0:
          expired = moment().add(1, 'days');
          break;
        case 1:
          expired = moment().add(3, 'days');
          break;
        case 2:
          expired = moment().add(7, 'days');
          break;
      }
      const count = userDoc.block_count + 1;
      await User.update(
        {
          block_message: expired,
          block_count: count
        },
        {
          where: { uid: args.uid }
        });
      // return resolve(unread_clean);
      resolve({
        display_name: userDoc.display_name,
        uid: userDoc.uid,
        count: count,
        expired: expired
      });
      // resolve({
      //   data: `Muted user: ${
      //     args.uid
      //   } successful, this user had been muted ${count} times, ${expired}, ${userDoc.status}`
      // });
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = muted;
