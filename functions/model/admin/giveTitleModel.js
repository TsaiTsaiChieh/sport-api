const modules = require('../../util/modules');

function giveTitleModel (args) {
  return new Promise(async function (resolve, reject) {
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

function getUserDoc (uid) {
  return new Promise(async function (resolve, reject) {
    const userSnapshot = await modules.getSnapshot('users', uid);
    if (!userSnapshot.exists) {
      return reject({ code: 404, error: 'user not found' });
    }
    if (userSnapshot.exists) {
      return resolve(userSnapshot.data());
    }
  });
}

function isAdmin (status) {
  return new Promise(function (resolve, reject) {
    if (status === 9) {
      return reject({
        code: 403,
        error: 'forbidden, admin could not have a title'
      });
    }
    return resolve(true);
  });
}

function getTitles (uid, period) {
  return new Promise(async function (resolve, reject) {
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

function insertTitles (args, titles, periodObj) {
  return new Promise(async function (resolve, reject) {
    // insert if titles.length === 0
    if (!titles.length) {
      // insert default title
      insertDefaultTitle(args, periodObj.period);
      insertFirestore(args, titles, periodObj);
    } else if (titles.length) { // if already have titles, should check duplication
      if (checkTitleDuplication(titles, args)) {
        return reject({
          code: 403,
          error: 'forbidden, this user had the same title'
        });
      }
      if (!checkTitleDuplication(titles, args)) {
        const updateResult = checkUpdateTitle(titles, args);
        insertDefaultTitle(args, periodObj.period);
        insertFirestore(args, updateResult.titles, periodObj, updateResult);
      }
    }
    return resolve(
      `Add title ${args.league}_${args.sport}_${args.rank} by admin uid: ${
        args.adminUid
      } on ${modules.moment().format('MMMM Do YYYY, h:mm:ss a')}`
    );
  });
}
function insertDefaultTitle (args, period) {
  const data = {};
  const defaultTitle = {
    rank: args.rank,
    league: args.league,
    sport: args.sport
  };
  modules.addDataInCollectionWithId('users', args.uid, {
    defaultTitle
  });
  data[`${period}_period`] = {
    default_title: defaultTitle
  };
  modules.addDataInCollectionWithId('users_titles', args.uid, data);
}
async function insertFirestore (args, titles, periodObj, updateResult = {}) {
  const GOD_STATUS = 2;
  if (!updateResult.updateFlag) {
    titles.push({
      rank: args.rank,
      league: args.league,
      sport: args.sport
    });
  }
  const titlesRecord = await getTitlesRecord(args);
  const record = updateTitleCount(titlesRecord, args.rank, updateResult);
  const data = {
    uid: args.uid,
    rank1_count: record.rank1_count,
    rank2_count: record.rank2_count,
    rank3_count: record.rank3_count,
    rank4_count: record.rank4_count
  };
  data[`${periodObj.period}_period`] = {
    date: periodObj.date,
    titles
  };

  modules.addDataInCollectionWithId('users', args.uid, {
    status: GOD_STATUS,
    titles
  });
  modules.addDataInCollectionWithId('users_titles', args.uid, data);
  const { customClaims } = await modules.firebaseAdmin.auth().getUser(args.uid);

  if (customClaims.titles) {
    if (customClaims.titles.includes(args.league)) {
      // do nothing
    }
    if (!customClaims.titles.includes(args.league)) {
      const userTitles = customClaims.titles;
      userTitles.push(args.league);
      modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, {
        role: GOD_STATUS,
        titles: userTitles
      });
    }
  } else if (!customClaims.titles) {
    modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, {
      role: GOD_STATUS,
      titles: [`${args.league}`]
    });
  }
}
async function getTitlesRecord (args) {
  const titlesRecord = await modules.getSnapshot('users_titles', args.uid);
  if (!titlesRecord.exists) {
    return {
      rank1_count: 0,
      rank2_count: 0,
      rank3_count: 0,
      rank4_count: 0
    };
  }
  if (titlesRecord.exists) {
    const {
      rank1_count,
      rank2_count,
      rank3_count,
      rank4_count
    } = titlesRecord.data();
    return { rank1_count, rank2_count, rank3_count, rank4_count };
  }
}

function updateTitleCount (record, rank, updateResult) {
  if (updateResult.updateFlag) {
    if (updateResult.oldRank === 1) record.rank1_count -= 1;
    if (updateResult.oldRank === 2) record.rank2_count -= 1;
    if (updateResult.oldRank === 3) record.rank3_count -= 1;
    if (updateResult.oldRank === 4) record.rank4_count -= 1;
  }
  if (rank === 1) record.rank1_count += 1;
  if (rank === 2) record.rank2_count += 1;
  if (rank === 3) record.rank3_count += 1;
  if (rank === 4) record.rank4_count += 1;
  return record;
}
function checkTitleDuplication (titles, args) {
  // check if titles duplication
  let duplicatedFlag = false;
  for (let i = 0; i < titles.length; i++) {
    const ele = titles[i];
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

function checkUpdateTitle (titles, args) {
  let updateFlag = false;
  let oldRank = 0;
  for (let i = 0; i < titles.length; i++) {
    const ele = titles[i];
    if (
      ele.sport === args.sport &&
      ele.league === args.league &&
      ele.rank !== args.rank
    ) {
      oldRank = ele.rank;
      ele.rank = args.rank;
      updateFlag = true;
    }
  }
  return { updateFlag, titles, oldRank };
}
module.exports = giveTitleModel;
