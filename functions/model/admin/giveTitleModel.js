const modules = require('../../util/modules');

function giveTitleModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // check if user exists
      const user = await getUserDoc(args.uid);
      // check user is admin
      await isAdmin(user.status);
      // get from user_titles collection
      const periodObj = modules.getTitlesPeriod(new Date());
      const titles = await getTitles(args.uid, periodObj.period);
      const result = await insertTitles(args, titles, periodObj);
      console.log(result);

      /* step 3: insert if titles.length === 0 */
      if (titles.length === 0) {
        return resolve({
          uid: args.uid,
          title: [
            {
              rank: args.rank,
              sport: args.sport,
              league: args.league
            }
          ]
        });
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
          console.log(
            `Add title ${args.league}_${args.sport}_${
              args.rank
            } by admin uid: ${args.adminUid} on ${new Date()} by TsaiChieh`
          );
          break;
        }
      }
      if (duplicatedFlag) {
        return reject({
          code: 403,
          error: 'forbidden, this user had the same title'
        });
      } else if (!updateFlag) {
        titles.push({
          rank: args.rank,
          league: args.league,
          sport: args.sport
        });
      }
      // status 2 is god like
      // userDoc.set({ titles, status: 2 }, { merge: true });
      modules.addDataInCollectionWithId('users', args.uid, {
        titles,
        status: 2
      });
      modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, { role: 2 });
      resolve({
        uid: args.uid,
        title: [
          {
            rank: args.rank,
            sport: args.sport,
            league: args.league
          }
        ]
      });
      console.log(
        `Add title ${args.league}_${args.sport}_${args.rank} by admin uid: ${
          args.adminUid
        } on ${new Date()} by TsaiChieh`
      );
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

function getUserDoc(uid) {
  return new Promise(async function(resolve, reject) {
    const userSnapshot = await modules.getSnapshot('users', uid);
    if (!userSnapshot.exists) {
      return reject({ code: 404, error: 'user not found' });
    }
    if (userSnapshot.exists) {
      return resolve(userSnapshot.data());
    }
  });
}

function isAdmin(status) {
  return new Promise(function(resolve, reject) {
    if (status === 9)
      return reject({
        code: 403,
        error: 'forbidden, admin could not have a title'
      });
    return resolve(true);
  });
}

function getTitles(uid, period) {
  return new Promise(async function(resolve, reject) {
    try {
      const titlesSnapshot = await modules.getSnapshot('users_titles', uid);
      if (!titlesSnapshot.exists) return resolve([]);
      if (titlesSnapshot.exists) {
        const data = titlesSnapshot.data();
        if (data[`${period}_period`]) {
          return resolve(data[`${period}_period`].titles);
        }
        if (!data[`${period}_period`]) {
          return resolve([]);
        }
      }
    } catch (err) {
      console.error(
        'Error in model/admin/giveTitleModel getTitles function by TsaiChieh',
        err
      );
      return reject({ code: 500, error: err });
    }
  });
}

function insertTitles(args, titles, periodObj) {
  return new Promise(async function(resolve, reject) {
    // insert if titles.length === 0
    if (!titles.length) {
      const title = { rank: args.rank, league: args.league, sport: args.sport };
      const data = { uid: args.uid };
      data[`${periodObj.period}_period`] = {
        date: periodObj.date,
        titles: [title]
      };
      modules.addDataInCollectionWithId('users', args.uid, {
        defaultTitle: title,
        status: 2
      });
      modules.addDataInCollectionWithId('users_titles', args.uid, data);
      modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, { role: 2 });
      return resolve(
        `Add title ${args.league}_${args.sport}_${args.rank} by admin uid: ${
          args.adminUid
        } on ${new Date()}`
      );
    }
  });
}
module.exports = giveTitleModel;
