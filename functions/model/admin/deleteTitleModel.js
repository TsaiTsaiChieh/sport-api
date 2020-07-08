const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');

function deleteTitle(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const now = new Date();
      // check if user exists
      await dbEngine.findUser(args.uid);
      const period = modules.getTitlesPeriod(now).period;
      const titlesObj = await getTitleFromUsersTitlesCollection(
        args.uid,
        period
      );
      resolve(
        await deleteTitleInUsersTitlesCollection(args, titlesObj, period)
      );
    } catch (err) {
      reject({ code: err.code, error: err });
    }
  });
}
function getTitleFromUsersTitlesCollection(uid, period) {
  return new Promise(async function(resolve, reject) {
    const userTitles = await modules.getSnapshot('users_titles', uid);
    if (!userTitles.exists) {
      return reject({
        code: 404,
        error: { devcode: 1306, msg: 'user status abnormal' }
      });
    }

    if (userTitles.exists) {
      const titlesObj = userTitles.data();
      const data = {
        rank1_count: titlesObj.rank1_count,
        rank2_count: titlesObj.rank2_count,
        rank3_count: titlesObj.rank3_count,
        rank4_count: titlesObj.rank4_count
      };
      data[`${period}_period`] = titlesObj[`${period}_period`];
      return resolve(data);
    }
  });
}

function deleteTitleInUsersTitlesCollection(args, titlesObj, period) {
  return new Promise(function(resolve, reject) {
    const checkResult = checkDeleteTitle(titlesObj, args, period);
    if (!checkResult.deleteFlag) {
      return reject({
        code: 404,
        error: { devcode: 1307, msg: 'delete failed' }
      });
    }
    if (checkResult.deleteFlag) {
      updateUserStatus(
        args,
        checkResult.titlesObj[`${period}_period`].titles,
        args.uid
      );
      updateFirestore(args.uid, checkResult.titlesObj, period);
      return resolve(
        `Delete title ${args.league}_${args.sport}_${args.rank} by admin uid: ${
          args.adminUid
        } on ${modules.moment().format('MMMM Do YYYY, h:mm:ss a')}`
      );
    }
  });
}

function checkDeleteTitle(titlesObj, args, period) {
  // default title check and set to null
  let deleteFlag = false;
  // should check default title
  const defaultTitle = titlesObj[`${period}_period`].default_title;
  if (
    args.sport === defaultTitle.sport &&
    args.rank === defaultTitle.rank &&
    args.league === defaultTitle.league
  ) { titlesObj[`${period}_period`].default_title = {}; }

  for (let i = 0; i < titlesObj[`${period}_period`].titles.length; i++) {
    const ele = titlesObj[`${period}_period`].titles[i];
    if (
      ele.sport === args.sport &&
      ele.rank === args.rank &&
      ele.league === args.league
    ) {
      deleteFlag = true;
      titlesObj[`${period}_period`].titles.splice(i, 1);
      // from i to delete 1 element
      if (args.rank === 1) titlesObj.rank1_count -= 1;
      if (args.rank === 2) titlesObj.rank2_count -= 1;
      if (args.rank === 3) titlesObj.rank3_count -= 1;
      if (args.rank === 4) titlesObj.rank4_count -= 1;
    }
  }

  return { deleteFlag, titlesObj };
}
async function updateUserStatus(args, titles, uid) {
  const NORMAL_STATUS = 1;
  const GOD_STATUS = 2;
  const { customClaims } = await modules.firebaseAdmin.auth().getUser(args.uid);
  if (titles.length === 0) {
    modules.addDataInCollectionWithId('users', uid, { status: NORMAL_STATUS });
    modules.firebaseAdmin
      .auth()
      .setCustomUserClaims(uid, { role: NORMAL_STATUS });
  }
  const userTitles = customClaims.titles;
  userTitles.splice(userTitles.indexOf(args.league), 1); // delete league from userTitle array
  modules.firebaseAdmin.auth().setCustomUserClaims(args.uid, {
    role: `${titles.length === 0 ? NORMAL_STATUS : GOD_STATUS}`,
    titles: userTitles
  });
}
function updateFirestore(uid, titlesObj, period) {
  modules.addDataInCollectionWithId('users_titles', uid, titlesObj);
  modules.addDataInCollectionWithId('users', uid, {
    titles: titlesObj[`${period}_period`].titles,
    defaultTitle: titlesObj[`${period}_period`].default_title
  });
}
module.exports = deleteTitle;
