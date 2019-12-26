const modules = require('../../util/modules');

function deleteTitle(args) {
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
      let titles = user.titles;
      let deleteFlag = false;
      if (titles) {
        for (let i = 0; i < titles.length; i++) {
          let ele = titles[i];
          if (
            ele.sport === args.sport &&
            ele.rank === args.rank &&
            ele.league === args.league
          ) {
            deleteFlag = true;
            // from i to delete 1 ele
            titles.splice(i, 1);
            userDoc.set({ titles }, { merge: true });
            break;
          }
        }
      }
      if (!deleteFlag) {
        reject({ code: 404, error: 'title not found' });
        return;
      }
      let defaultTitle = user.defaultTitle;
      if (defaultTitle) {
        if (
          defaultTitle.sport === args.sport &&
          defaultTitle.rank === args.rank &&
          defaultTitle.league === args.league
        ) {
          userDoc.set({ defaultTitle: {} }, { merge: true });
        }
      }
      resolve({
        data: `Delete user: ${args.uid}, title:[${args.rank} ${args.sport} ${args.league}] successful`
      });
    } catch (err) {
      console.log('error happened...', err);
      reject({ coder: 500, error: err });
    }
  });
}
module.exports = deleteTitle;
