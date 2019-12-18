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
      /* step 2: check if titles duplication */

      if (titles.length === 0) {
        titles.push({
          rank: args.rank,
          league: args.league,
          sport: args.sport
        });
        userDoc.set({ titles }, { merge: true });
        resolve({
          data: `Given user: ${args.uid} a title: [${args.rank} ${args.sport} ${args.league}] successful`
        });
        return;
      }

      /* step 3: update rank */
      titles.forEach(function(ele, idx) {
        if (
          ele.sport === args.sport &&
          ele.league === args.league &&
          ele.rank === args.rank
        ) {
          // console.log(`..0..`);
          reject({
            code: 403,
            error: 'forbidden, this user had the same title'
          });
          // do nothing
        } else if (
          ele.sport === args.sport &&
          ele.league === args.league &&
          ele.rank !== args.rank &&
          ele.rank !== 1
        ) {
          // console.log(`..1..`);
          ele.rank = args.rank;
        } else {
          // console.log(`..2..`);
          titles.push({
            rank: args.rank,
            league: args.league,
            sport: args.sport
          });
        }
      });
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
