/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const AppError = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const NORMAL_USER = 1;
const GOD_USER = 2;
const matchScheduledStatus = 2;

function prematch(args) {
  return new Promise(async function (resolve, reject) {
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
  console.log(args.token.customClaims);

  return new Promise(function (resolve, reject) {
    if (args.sell === 1 && !userTitles.includes(args.league))
      return reject(new AppError.UserCouldNotSell());
    else return resolve();
  });
}

// 檢查玩家想賣牌，是否屬於大神
function isNormalUserSell(sell, role) {
  return new Promise(function (resolve, reject) {
    role = Number.parseInt(role);
    if (role === NORMAL_USER && sell === 1)
      return reject(new AppError.UserCouldNotSell());
    else return resolve();
  });
}

async function checkMatches(args) {
  return new Promise(async function (resolve, reject) {
    const needed = [];
    const failed = [];
    // console.log(args.matches);

    try {
      for (let i = 0; i < args.matches.length; i++) {
        const ele = args.matches[i];

        await isMatchValid(args, ele, { needed, failed });
        //   await isMatchExist(args, ele, { needed, failed });
        // }
        // for (let i = 0; i < needed.length; i++) {
        //   isBeforeScheduled(args.now, i, { needed, failed });
        //   isOpened(i, { needed, failed });
        //   isNewestHandicap(i, { needed, failed });
        //   //
        //   if (args.token.customClaims.role === GOD_USER) {
        //     await isGodUpdate(args.token.uid, i, { needed, failed });
        //     if (needed[i].length === undefined) {
        //       // 有資料的
        //       await isGodSellConsistent(args, i, { needed, failed });
        //     }
        //   }
      }
      console.log({ needed, failed });

      return resolve({ needed, failed });
    } catch (err) {
      return reject(err);
    }
  });
}
async function isMatchValid(args, ele, filter) {
  return new Promise(async function (resolve, reject) {
    console.log(ele);

    const { league } = args;
    let handicapType = '';
    let handicapId;
    if (ele.spread) {
      handicapType = 'spread';
      handicapId = Number.parseInt(ele.spread[0]);
    } else if (ele.totals) {
      handicapType = 'totals';
      handicapId = Number.parseInt(ele.totals[0]);
    }
    try {
      const results = await db.sequelize.query(
        `SELECT *
           FROM match__${league}s AS game
          WHERE game.bets_id = :id
            AND game.${handicapType}_id = :handicapId
            AND game.status = ${matchScheduledStatus}`,
        {
          replacements: { id: ele.id, handicapId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      if (!results.length) {
        ele.code = 404;
        ele.error = `Match id: ${ele.id} & Handicap id ${handicapId} in ${args.league} not found`;
        filter.failed.push(ele);
      } else if (results) {
        filter.needed.push(ele);
      }
      resolve(filter);
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
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

function isBeforeScheduled(now, i, filter) {
  const ele = filter.needed[i];
  if (ele.data.flag.status !== 2) {
    // if (now >= ele.data.scheduled._seconds * 1000) {
    const error = {
      code: 403,
      error: `Match id: ${ele.id} already start or end, forbidden`
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
    query.docs.map(function (doc) {
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
  return new Promise(async function (resolve, reject) {
    neededResult = isNeeded(filter.needed);
    if (!neededResult) {
      return reject(new AppError.UserPredictFailed((message = filter.failed)));
    } else if (neededResult) {
      await insertDB(args, filter.needed);
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

async function insertDB(args, needed) {
  const results = [];
  for (let i = 0; i < needed.length; i++) {
    const ele = needed[i];
    const data = {
      bets_id: ele.id,
      sell: args.sell,
      uid: args.token.uid
    };
    if (ele.spread) {
      data.spread_id = ele.spread[0];
      data.spread_option = ele.spread[1];
      data.spread_bets = ele.spread[2];
    } else if (ele.totals) {
      data.totals_id = ele.totals[0];
      data.totals_option = ele.totals[1];
      data.totals_bets = ele.totals[2];
    }

    try {
      if (ele.length === undefined) {
        results.push(await db.Prediction.create(data));
        // results.push(
        //   modules.addDataInCollectionWithId(
        //     modules.db.prediction,
        //     `${ele.id}_${args.token.uid}`,
        //     repackagePrediction(args, ele)
        //   )
        // );
      }
      return await Promise.all(results);
    } catch (error) {
      // console.log(error);

      return error;
    }
  }
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
    user_status: args.token.customClaims.role,
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
  // console.log(data);

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
