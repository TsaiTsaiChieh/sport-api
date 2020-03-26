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
      return resolve(result);
    } catch (err) {
      return reject({ code: err.code, error: err });
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
      return reject({ code: 500, error: err });
    }
  });
}

function insertTitles(args, titles, periodObj) {
  return new Promise(async function(resolve, reject) {
    // insert if titles.length === 0
    if (!titles.length) {
      modules.addDataInCollectionWithId('users', args.uid, {
        defaultTitle: {
          rank: args.rank,
          league: args.league,
          sport: args.sport
        }
      });
      insertFirestore(args, titles, periodObj);
    }
    // if already have titles, should check duplication
    else if (titles.length) {
      if (checkTitleDuplication(titles, args)) {
        return reject({
          code: 403,
          error: 'forbidden, this user had the same title'
        });
      }
      if (!checkTitleDuplication(titles, args)) {
        updateResult = checkUpdateTitle(titles, args);
        insertFirestore(
          args,
          updateResult.titles,
          periodObj,
          updateResult.updateFlag
        );
      }
    }
    return resolve(
      `Add title ${args.league}_${args.sport}_${args.rank} by admin uid: ${
        args.adminUid
      } on ${new Date()}`
    );
  });
}

function insertFirestore(args, titles, periodObj, updateFlag = false) {
  if (!updateFlag)
    titles.push({
      rank: args.rank,
      league: args.league,
      sport: args.sport
    });
  const data = { uid: args.uid };
  data[`${periodObj.period}_period`] = {
    date: periodObj.date,
    titles
  };
  modules.addDataInCollectionWithId('users', args.uid, {
    status: 2,
    titles
  });
  modules.addDataInCollectionWithId('users_titles', args.uid, data);
  modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, { role: 2 });
}
function checkTitleDuplication(titles, args) {
  // check if titles duplication
  let duplicatedFlag = false;
  for (let i = 0; i < titles.length; i++) {
    ele = titles[i];
    if (
      ele.sport === args.sport &&
      ele.league === args.league &&
      ele.rank === args.rank
    ) {
      duplicatedFlag = true;
      break;
    }
  }
  return duplicatedFlag;
}

function checkUpdateTitle(titles, args) {
  let updateFlag = false;
  for (let i = 0; i < titles.length; i++) {
    const ele = titles[i];
    if (
      ele.sport === args.sport &&
      ele.league === args.league &&
      ele.rank !== 1 &&
      args.rank !== 1
    ) {
      ele.rank = args.rank;
      updateFlag = true;
    }
  }
  return { updateFlag, titles };
}
module.exports = giveTitleModel;
