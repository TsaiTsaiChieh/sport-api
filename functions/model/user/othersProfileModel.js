const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');

async function othersProfile(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // userUid 為登入者自己的 uid，otherUid 為他人的 uid
      const { userUid, othersUid } = args;
      const otherUserData = await dbEngine.findUser(othersUid);
      const followLeague = await getUserFollowLeague(userUid, othersUid);
      return resolve(repackageReturnData(otherUserData, followLeague));
    } catch (err) {
      return reject(err);
    }
  });
}

function getUserFollowLeague(userUid, othersUid) {
  return new Promise(async function(resolve, reject) {
    try {
      // TODO this table should tune
      // index is ref, taking 165 ms
      const results = await db.User_FavoriteGod.findAll(
        {
          where: { uid: userUid, god_uid: othersUid },
          raw: true,
          attributes: ['league']
        });
      return resolve(results);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function repackageReturnData(userData, followLeague) {
  try {
    if (followLeague.length) followLeague = repackageLeagueData(followLeague);
    const data = {
      uid: userData.uid,
      avatar: userData.avatar,
      display_name: userData.display_name,
      signature: userData.signature,
      fans: userData.fan_count,
      is_like: followLeague.length !== 0,
      league: followLeague
    };
    return data;
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

function repackageLeagueData(data) {
  try {
    const league = [];
    for (let i = 0; i < data.length; i++) {
      league.push(data[i].league);
    }
    return league;
  } catch (err) {
    console.error(`${err.stack} by TsaiChieh`);
    throw AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  }
}

module.exports = othersProfile;
