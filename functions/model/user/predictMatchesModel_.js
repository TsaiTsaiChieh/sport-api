/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const AppError = require('../../util/AppErrors');

const NORMAL_USER = 1;
const GOD_USER = 2;
function prematch(args) {
  return new Promise(async function(resolve, reject) {
    // 有無賽事 ID，檢查是否可以下注了（且時間必須在 scheduled 前），盤口 ID 是否是最新的
    try {
      // 檢查此使用者身份
      const customClaims = await dbEngine.findUser(args.token.uid);
      await isGodBelongToLeague(args, customClaims.titles);
      await isNormalUserSell(args.sell, customClaims.role);
      await checkMatches(args);
    } catch (error) {
      reject(error);
    }
  });
}

async function checkMatches(args) {
  const needed = [];
  const failed = [];

  for (let i = 0; i < args.matches.length; i++) {
    const ele = args.matches[i];
    await isMatchExist(args, ele, { needed, failed });
    // console.log('isMatchExist.....', i, needed, '||', failed);
  }
  for (let i = 0; i < needed.length; i++) {
    // const ele = needed[i];
    // ele.now = args.now;

    isBeforeScheduled(args.now, i, { needed, failed });
    // console.log('1. isBeforeScheduled....', i, needed, '||', failed);
  }
  for (let i = 0; i < needed.length; i++) {
    // const ele = needed[i];
    isOpened(i, { needed, failed });
    // console.log('2. isOpened....', i, needed, '||', failed);
  }
  for (let i = 0; i < needed.length; i++) {
    // const ele = needed[i];
    isNewestHandicap(i, { needed, failed });
    // console.log('3. isNewestHandicap....', i, needed, '||', failed);
  }
  if (args.token.role === GOD_USER) {
    // let prediction;
    for (let i = 0; i < needed.length; i++) {
      // const ele = needed[i];
      await isGodUpdate(args.token.uid, i, {
        needed,
        failed
      });
      // console.log('4. isGodUpdate....', i, needed, '||', failed);
    }
    for (let i = 0; i < needed.length; i++) {
      await isGodSellConsistent(args, i, { needed, failed });
      // console.log('5. isGodSellConsistent....', i, needed, '||', failed);
    }
  }
  return { needed, failed };
}

async function isGodSellConsistent(args, i, filter) {
  const date = modules
    .moment(filter.needed[i].data.scheduled._seconds * 1000)
    .utcOffset(8)
    .format('YYYYMMDD');
  const query = await modules.firestore
    .collection(modules.db.prediction)
    .where('uid', '==', args.token.uid)
    .where('date', '==', date)
    .get();
  if (query.size > 0) {
    query.docs.map(function(doc) {
      if (doc.data() !== args.sell) {
        const error = {
          code: 403,
          error: `Cannot be changed to free ${args === 1 ? 'sell' : 'free'}`
        };
        filterProcessor(filter, i, error);
      }
    });
  }
}
async function isGodUpdate(uid, i, filter) {
  const ele = filter.needed[i];
  const predictionSnapshot = await modules.getSnapshot(
    modules.db.prediction,
    `${ele.id}_${uid}`
  );
  if (predictionSnapshot.exists) {
    const prediction = predictionSnapshot.data();
    if (ele.spread) {
      if (prediction.spread) {
        const error = {
          code: 403,
          error: `Spread id: ${ele.totals[0]} already exist, locked`
        };
        filterProcessor(filter, i, error);
      }
    }
    if (ele.totals) {
      if (prediction.totals) {
        const error = {
          code: 403,
          error: `Totals id: ${ele.totals[0]} already exist, locked`
        };
        filterProcessor(filter, i, error);
      }
    }
  }
}

function isNewestHandicap(i, filter) {
  const ele = filter.needed[i];
  if (ele.spread) {
    if (ele.spread[0] !== ele.data.newest_spread.handicap_id) {
      const error = {
        code: 403,
        error: `Spread id: ${ele.totals[0]} conflict with the newest`
      };
      filterProcessor(filter, i, error);
    }
  } else if (ele.totals) {
    if (ele.totals[0] !== ele.data.newest_totals.handicap_id) {
      const error = {
        code: 403,
        error: `Totals id: ${ele.totals[0]} conflict with the newest`
      };
      filterProcessor(filter, i, error);
    }
  }
}

function isOpened(i, filter) {
  const ele = filter.needed[i];
  if (ele.spread) {
    if (ele.data.flag.spread === 0) {
      const error = {
        code: 403,
        error: `Spread id: ${ele.spread[0]} OTB, forbidden`
      };
      filterProcessor(filter, i, error);
    }
  } else if (ele.totals) {
    if (ele.data.flag.totals === 0) {
      const error = {
        code: 403,
        error: `Totals id: ${ele.spread[0]} OTB, forbidden`
      };
      filterProcessor(filter, i, error);
    }
  }
}

function isBeforeScheduled(now, i, filter) {
  const ele = filter.needed[i];
  if (now >= ele.data.scheduled._seconds * 1000) {
    const error = {
      code: 403,
      error: `Match id: ${ele.id} already start, forbidden`
    };
    filterProcessor(filter, i, error);
  }
}

function filterProcessor(filter, i, error) {
  const ele = filter.needed[i];
  ele.code = error.code;
  ele.error = error.error;
  delete ele.data;
  filter.needed.splice(i, 1);
  filter.failed.push(ele);
}

async function isMatchExist(args, ele, filter) {
  const matchSnapshot = await modules.getSnapshot(
    modules.leagueCodebook(args.league).match,
    ele.id
  );
  if (!matchSnapshot.exists) {
    ele.code = 404;
    ele.error = `Match id: ${ele.id} in ${args.league} not found`;
    filter.failed.push(ele);
  } else if (matchSnapshot.exists) {
    // append match information
    ele.data = matchSnapshot.data();
    filter.needed.push(ele);
  }
}

// 檢查玩家想賣牌，是否屬於該聯盟的大神
function isGodBelongToLeague(args, userTitles = []) {
  return new Promise(function(resolve, reject) {
    if (args.sell === 1 && !userTitles.includes(args.league))
      return reject(new AppError.UserCouldNotSell());
    else return resolve();
  });
}

// 檢查玩家想賣牌，是否屬於大神
function isNormalUserSell(sell, role) {
  return new Promise(function(resolve, reject) {
    role = Number.parseInt(role);
    if (role === NORMAL_USER && sell === 1)
      return reject(new AppError.UserCouldNotSell());
    else return resolve();
  });
}

module.exports = prematch;
