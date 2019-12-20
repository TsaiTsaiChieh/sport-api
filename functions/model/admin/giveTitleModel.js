const modules = require('../../util/modules');

function giveTitleModel(args) {
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
      /* step 2: insert if titles.length === 0 */
      if (titles.length === 0) {
        titles.push({
          rank: args.rank,
          league: args.league,
          sport: args.sport
        });
        // set default title
        userDoc.set({ titles, defaultTitle: titles[0] }, { merge: true });
        resolve({
          data: `Given user: ${args.uid} a title: [${args.rank} ${args.sport} ${args.league}] successful`
        });
        return;
      }

      let duplicatedFlag = false;
      let updateFlag = false;
      for (let i = 0; i < titles.length; i++) {
        ele = titles[i];
        /* step 3: check if titles duplication */
        if (
          ele.sport === args.sport &&
          ele.league === args.league &&
          ele.rank === args.rank
        ) {
          duplicatedFlag = true;
          break;
        }
        /* step 4: update rank */
        if (
          ele.sport === args.sport &&
          ele.league === args.league &&
          ele.rank !== 1 &&
          args.rank !== 1
        ) {
          updateFlag = true;
          ele.rank = args.rank;
          break;
        }
      }
      if (duplicatedFlag) {
        reject({
          code: 403,
          error: 'forbidden, this user had the same title'
        });
        return;
      } else if (!updateFlag) {
        titles.push({
          rank: args.rank,
          league: args.league,
          sport: args.sport
        });
      }
      userDoc.set({ titles }, { merge: true });
      resolve({
        data: `Given user: ${args.uid} a title: [${args.rank} ${args.sport} ${args.league}] successful`
      });
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = giveTitleModel;