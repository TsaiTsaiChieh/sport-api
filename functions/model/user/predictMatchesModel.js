/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const AppError = require('../../util/AppErrors');

const NORMAL_USER = 1;
const GOD_USER = 2;
const TAIWAN_UTF = 8;

function prematch(args) {
  return new Promise(async function(resolve, reject) {
    // 有無賽事 ID，檢查是否可以下注了（且時間必須在 scheduled 前），盤口 ID 是否是最新的
    try {
      // 檢查此使用者身份
      const customClaims = await dbEngine.findUser(args.token.uid);
      await isGodBelongToLeague(args, customClaims.titles);
      await isNormalUserSell(args.sell, customClaims.role);
      const filter = await checkMatches(args);
      return resolve(await sendPrediction(args, filter));
    } catch (err) {
      return reject(err);
    }
  });
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

async function checkMatches(args) {
  const needed = [];
  const failed = [];

  for (let i = 0; i < args.matches.length; i++) {
    const ele = args.matches[i];
    await isMatchExist(args, ele, { needed, failed });
  }
  for (let i = 0; i < needed.length; i++) {
    isBeforeScheduled(args.now, i, { needed, failed });
    isOpened(i, { needed, failed });
    isNewestHandicap(i, { needed, failed });
    if (args.token.role === GOD_USER) {
      await isGodUpdate(args.token.uid, i, { needed, failed });
      if (needed[i].length === undefined) {
        await isGodSellConsistent(args, i, { needed, failed });
      }
    }
  }
  return { needed, failed };
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
    // filter.needed_temp.push(ele);
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
  filter.needed[i] = []; // clear
  filter.failed.push(ele);
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
        error: `Totals id: ${ele.totals[0]} OTB, forbidden`
      };
      filterProcessor(filter, i, error);
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
          error: `Spread id: ${ele.spread[0]} already exist, locked`
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

async function isGodSellConsistent(args, i, filter) {
  const date = modules
    .moment(filter.needed[i].data.scheduled._seconds * 1000)
    .utcOffset(TAIWAN_UTF)
    .format('YYYYMMDD');
  const query = await modules.firestore
    .collection(modules.db.prediction)
    .where('uid', '==', args.token.uid)
    .where('date', '==', date)
    .get();

  if (query.size > 0) {
    query.docs.map(function(doc) {
      if (doc.data().sell !== args.sell) {
        const error = {
          code: 403,
          error: `Cannot be changed to ${args === 1 ? 'sell' : 'free'}`
        };
        filterProcessor(filter, i, error);
      }
    });
  }
}

function sendPrediction(args, filter) {
  return new Promise(async function(resolve, reject) {
    neededResult = isNeeded(filter.needed);
    if (!neededResult) {
      return reject(new AppError.UserPredictFailed((message = filter.failed)));
    } else if (neededResult) {
      await insertFirestore(args, filter.needed);
      return resolve(repackageReturnData(filter));
    }
  });
}

function isNeeded(needed) {
  let count = 0;
  for (let i = 0; i < needed.length; i++) {
    const ele = needed[i];
    if (ele.length === 0) count++;
  }
  if (count === needed.length) return false;
  return true;
}

async function insertFirestore(args, needed) {
  const results = [];
  for (let i = 0; i < needed.length; i++) {
    const ele = needed[i];
    if (ele.length === undefined) {
      results.push(
        modules.addDataInCollectionWithId(
          modules.db.prediction,
          `${ele.id}_${args.token.uid}`,
          repackagePrediction(args, ele)
        )
      );
    }
  }
  return await Promise.all(results);
}

function repackagePrediction(args, ele) {
  const date = modules
    .moment(ele.data.scheduled._seconds * 1000)
    .utcOffset(TAIWAN_UTF)
    .format('YYYYMMDD');
  const data = {
    bets_id: ele.id,
    uid: args.token.uid,
    league: args.league,
    user_status: args.token.role,
    sell: args.sell,
    date,
    date_timestamp: modules.moment(date).valueOf(),
    scheduled: ele.data.scheduled._seconds * 1000,
    home: {
      alias: ele.data.home.alias,
      alias_ch: ele.data.home.alias_ch
    },
    away: {
      alias: ele.data.away.alias,
      alias_ch: ele.data.away.alias_ch
    }
  };
  if (ele.spread) {
    data.spread = {
      handicap_id: ele.spread[0],
      predict: ele.spread[1],
      handicap: ele.data.spread[ele.spread[0]].handicap,
      bets: ele.spread[2],
      update_time: Date.now()
    };
  }
  if (ele.totals) {
    data.totals = {
      handicap_id: ele.totals[0],
      predict: ele.totals[1],
      bets: ele.totals[2],
      handicap: ele.data.totals[ele.totals[0]].handicap,
      update_time: Date.now()
    };
  }
  return data;
}

function repackageReturnData(filter) {
  filter.success = [];
  for (let i = 0; i < filter.needed.length; i++) {
    const ele = filter.needed[i];
    if (ele.length === undefined) {
      delete ele.data;
      filter.success.push(ele);
    }
  }
  delete filter.needed;
  return filter;
}
module.exports = prematch;
