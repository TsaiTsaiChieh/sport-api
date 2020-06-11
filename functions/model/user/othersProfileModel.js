const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const GOD_USER = 2;

async function othersProfile(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // userUid 為登入者自己的 uid，otherUid 為他人的 uid
      let followLeague = []; // 若使用者有登入，會去取得該使用者有加入最愛的使用者
      let otherUserTitle = []; // 他人的預設稱號（大神才有）
      const { userUid, othersUid } = args;
      const otherUserData = await dbEngine.findUser(othersUid);
      otherUserTitle = await getDefaultTitle(args, otherUserData);
      if (args.userUid) followLeague = await getUserFollowLeague(userUid, othersUid);
      return resolve(repackageReturnData(args, { otherUserData, otherUserTitle }, followLeague));
    } catch (err) {
      return reject(err);
    }
  });
}

function getDefaultTitle(args, otherUserData) {
  return new Promise(async function(resolve, reject) {
    try {
      if (otherUserData.status !== GOD_USER) return resolve([]);
      if (otherUserData.status === GOD_USER) {
        // index is const(users) or index_merge(titles), taking 165ms
        const result = await db.sequelize.query(
          `SELECT titles.*
             FROM users
        LEFT JOIN titles ON (users.uid = titles.uid 
              AND users.default_god_league_rank = titles.league_id)
            WHERE titles.uid = :othersUid
              AND titles.period = ${modules.getTitlesPeriod(args.now).period}
            LIMIT 1`,
          {
            type: db.sequelize.QueryTypes.SELECT,
            replacements: { othersUid: otherUserData.uid }
          });
        return resolve(result[0]);
      }
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function getUserFollowLeague(userUid, othersUid) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is ref(user__favoriteplayer), taking 165 ms
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

function repackageReturnData(args, others, followLeague) {
  const othersTitleLength = others.otherUserTitle.length !== 0;

  try {
    if (followLeague.length) followLeague = repackageLeagueData(followLeague);
    const data = {
      others_uid: others.otherUserData.uid,
      avatar: others.otherUserData.avatar,
      display_name: others.otherUserData.display_name,
      signature: others.otherUserData.signature,
      fans: others.otherUserData.fan_count,
      is_like: followLeague.length !== 0,
      league: followLeague,
      status: others.otherUserData.status,
      login_boolean: !!args.userUid,
      others_league_id: othersTitleLength ? others.otherUserTitle.league_id : null,
      others_league_name: othersTitleLength ? modules.leagueDecoder(others.otherUserTitle.league_id) : null,
      others_rank: othersTitleLength ? others.otherUserTitle.rank_id : null,
      others_title: othersTitleLength ? modules.getTitles(others.otherUserTitle, others.otherUserTitle.default_title) : null
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
