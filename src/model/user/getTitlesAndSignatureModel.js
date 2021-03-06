const modules = require('../../util/modules');
const logger = require('firebase-functions/lib/logger');
const db = require('../../util/dbUtil');
const dbEngine = require('../../util/databaseEngine');
const AppErrors = require('../../util/AppErrors');
const { leagueDecoder } = require('../../util/leagueUtil');
const GOD_STATUS = 2;

function getTitlesAndSignature(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // check if user exists
      let titles = [];
      const userData = await dbEngine.findUser(args.uid);
      titles = await getGodAllTitles(args, userData);
      return resolve(repackageReturnData(userData, titles));
    } catch (err) {
      return reject({ code: err.code, error: err });
    }
  });
}

function getGodAllTitles(args, userData) {
  return new Promise(async function(resolve, reject) {
    try {
      if (userData.status !== GOD_STATUS) return resolve([]);
      if (userData.status === GOD_STATUS) {
        const { period } = modules.getLastPeriod(args.now);
        // index is index_merge(titles), taking 170ms
        const result = await db.Title.findAll({
          where: { uid: args.uid, period },
          attributes: ['league_id', 'rank_id'],
          raw: true
        });
        return resolve(result);
      }
    } catch (err) {
      logger.error(err.stack);
      return reject(new AppErrors.MysqlError(err.stack));
    }
  });
}

function repackageReturnData(userData, titles) {
  try {
    const data = {
      uid: userData.uid,
      role: userData.status === GOD_STATUS ? 'GOD' : 'NORMAL',
      display_name: userData.display_name,
      avatar: userData.attributes,
      signature: userData.signature,
      default_title: defaultTitle(userData, titles),
      all_titles: {
        titles: repackageTitles(titles)
      }
    };
    return data;
  } catch (err) {
    logger.error(err.stack);
    throw new AppErrors.RepackageError(err.stack);
  }
}

function defaultTitle(userData, titles) {
  for (let i = 0; i < titles.length; i++) {
    const ele = titles[i];
    if (ele.league_id === userData.default_god_league_rank) return ele;
  }
  return { league_id: '0', league_name: null, rank_id: 0 };
}

function repackageTitles(titles) {
  for (let i = 0; i < titles.length; i++) {
    const ele = titles[i];
    ele.league_name = leagueDecoder(ele.league_id);
  }
  return titles;
}

module.exports = getTitlesAndSignature;
