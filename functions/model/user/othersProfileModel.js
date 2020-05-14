const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');

async function othersProfile(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // userUid 為登入者自己的 uid，othersUid 為他人的 uid
      const { userUid, othersUid } = args;
      const userData = await dbEngine.findUser(userUid);
      const followData = await getUserFollowsData(userUid, othersUid);
      return resolve(repackageReturnData(userData, followData));
      // return resolve(await getUserDataAndFollows(args.uid));
    } catch (err) {
      return reject(err);
    }
  });
}

function getUserFollowsData(userUid, othersUid) {
  return new Promise(async function(resolve, reject) {
    try {
      // TODO this table should tune
      // index is ref, taking 165 ms
      const results = await db.User_FavoriteGod.findAll(
        {
          where: { uid: userUid, god_uid: othersUid },
          raw: true,
          attributes: ['type']
        });
      return resolve(results);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageReturnData(userData, followData) {
  try {
    const data = {
      uid: userData.uid,
      avatar: userData.avatar,
      display_name: userData.display_name,
      signature: userData.signature,
      fans: userData.fans,
      is_like: !!followData
    };
    return data;
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

module.exports = othersProfile;
