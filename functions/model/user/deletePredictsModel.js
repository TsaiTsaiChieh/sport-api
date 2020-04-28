/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const modules = require('../../util/modules');
const AppError = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const NORMAL_USER = 1;
const scheduledStatus = 2;
const NORMAL_USER_SELL = -1;

function deletePredictions(args) {
  return new Promise(async function (resolve, reject) {
    try {
      await isNormalUser(args);
      await checkMatches(args);
      await deletePredictions(args, filter);
      console.log('===', filter, '===');
      return resolve(returnData(filter));
    } catch (err) {
      return reject(err);
    }
  });
}

// 檢查使用者是否為一般玩家
function isNormalUser(args) {
  return new Promise(function (resolve, reject) {
    args.token.customClaims === NORMAL_USER
      ? resolve()
      : reject(new AppError.OnlyAcceptNormalUser());
  });
}

async function checkMatches(args) {
  return new Promise(async function (resolve, reject) {
    const needed = [];
    const failed = [];

    try {
      for (let i = 0; i < args.matches.length; i++) {
        const ele = args.matches[i];
        await isMatchValid(args, ele, { needed, failed });
      }
      for (let i = 0; i < needed.length; i++) {
        await isHandicapExist(args, i, { needed, failed });
      }
      return resolve();
    } catch (err) {
      return reject(err);
    }
  });
}

// 檢查賽事是否合法
function isMatchValid(args, ele, filter) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT bets_id
           FROM matches
          WHERE bets_id = :id
            AND status = ${scheduledStatus}`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { id: ele.id }
        }
      );

      // 若賽事 id 無效，推到 failed；反之，推到 needed
      if (!result.length) {
        ele.code = 404;
        ele.error = `Match id: ${ele.id} in ${args.league} not found`;
        filter.failed.push(ele);
      } else {
        filter.needed.push(ele);
      }
      resolve(filter);
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}
// 檢查盤口是否存在在該使用者的預測單裡
function isHandicapExist(args, i, filter) {
  return new Promise(async function (resolve, reject) {
    const ele = filter.needed[i];
    try {
      const { handicapType, handicapId } = handicapProcessor(ele);

      const result = await db.sequelize.query(
        `SELECT * 
           FROM user__predictions
          WHERE uid = "${args.token.uid}"
            AND bets_id = :id
            AND ${handicapType}_id = "${handicapId}"
            AND sell = ${NORMAL_USER_SELL}`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { id: ele.id }
        }
      );

      if (!result.length) {
        const error = {
          code: 404,
          error: `${handicapType} id: ${handicapId} in ${args.league} not found`
        };
        filterProcessor(filter, i, error);
      }
      return resolve();
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}
// 轉換要查詢哪種盤口種類
function handicapProcessor(ele) {
  let handicapType = '';
  let handicapId;

  if (ele.spread) {
    handicapType = 'spread';
    handicapId = ele.spread;
  } else if (ele.totals) {
    handicapType = 'totals';
    handicapId = ele.totals;
  }
  return { handicapType, handicapId };
}
// 將無效的賽事 id 和盤口 id 推到 failed，也清空原本在 needed 的位置
function filterProcessor(filter, i, error) {
  const ele = filter.needed[i];
  ele.code = error.code;
  ele.error = error.error;
  delete ele.data;
  filter.needed[i] = []; // clear
  filter.failed.push(ele);
}

function deletePredictions(args, filter) {
  return new Promise(async function (resolve, reject) {
    try {
      for (let i = 0; i < filter.needed.length; i++) {
        const ele = filter.needed[i];
        const { handicapType, handicapId } = handicapProcessor(ele);
        if (ele.length === undefined) {
          const result = await db.sequelize.query(
            `UPDATE user__predictions
              SET ${handicapType}_id = NULL, ${handicapType}_bets = NULL, ${handicapType}_option = NULL
            WHERE ${handicapType}_id = "${handicapId}"
              AND bets_id = :id
              AND uid = "${args.token.uid}"`,
            {
              type: db.sequelize.QueryTypes.UPDATE,
              replacements: { id: ele.id }
            }
          );
          // result = [undefined, 1] 代表有更新成功；反之 [undefined, 0]
          if (!result[1]) {
            const error = {
              code: 404,
              error: `${handicapType} id: ${handicapId} in ${args.league} update failed`
            };
            filterProcessor(filter, i, error);
          }
        }
      }
      return resolve(filter);
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

function returnData(filter) {
  return new Promise(function (resolve, reject) {
    const neededResult = isNeeded(filter.needed);
    if (!neededResult) {
      return reject(
        new AppError.DeletePredictionsFailed({ failed: filter.failed })
      );
    } else if (neededResult) {
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

async function deleteFromDB(args, filter) {
  return new Promise(async function (resolve, reject) {
    try {
      for (let i = 0; i < filter.needed.length; i++) {
        const ele = filter.needed[i];
        const { handicapType, handicapId } = handicapProcessor(ele);
        if (ele.length === undefined) {
          const result = await db.sequelize.query(
            `UPDATE user__predictions
              SET ${handicapType}_id = NULL, ${handicapType}_bets = NULL, ${handicapType}_option = NULL
            WHERE ${handicapType}_id = "${handicapId}"
              AND bets_id = :id
              AND uid = "${args.token.uid}"`,
            {
              type: db.sequelize.QueryTypes.UPDATE,
              replacements: { id: ele.id }
            }
          );
          // result = [undefined, 1] 代表有更新成功；反之 [undefined, 0]
          if (!result[1]) {
            const error = {
              code: 404,
              error: `${handicapType} id: ${handicapId} in ${args.league} update failed`
            };
            filterProcessor(filter, i, error);
          }
        }
      }
      return resolve();
      // return resolve(await Promise.all(results));
    } catch (err) {
      console.log('========', err);
      return reject(new AppError.MysqlError());
    }
  });
}

function repackagePrediction(args, ele) {
  const data = {
    bets_id: ele.id,
    league_id: ele.league_id,
    sell: args.sell,
    match_scheduled: ele.match_scheduled,
    uid: args.token.uid,
    user_status: args.token.customClaims.role
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
  return data;
}
function repackageReturnData(filter) {
  filter.success = [];
  for (let i = 0; i < filter.needed.length; i++) {
    const ele = filter.needed[i];
    if (ele.length === undefined) {
      delete ele.league_id;
      delete ele.match_scheduled;
      filter.success.push(ele);
    }
  }
  // for (let i = 0; i < filter.failed.length; i++) {
  //   const ele = filter.failed[i];
  //   if (ele.length === undefined) {

  //   }
  // }
  // delete filter.needed;
  return filter;
}
module.exports = deletePredictions;
