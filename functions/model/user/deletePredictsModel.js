/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const scheduledStatus = 2;
const NORMAL_USER_SELL = -1;

function deletePredictions(args) {
  return new Promise(async function(resolve, reject) {
    try {
      await isGodBelongsToLeague(args);
      const filter = await checkMatches(args);
      await updatePredictions(args, filter);
      await deletePredictionsWhichAreNull(args.token.uid, args.league);
      return resolve(returnData(filter));
    } catch (err) {
      return reject(err);
    }
  });
}

// 非為該聯盟的大神才能刪除
function isGodBelongsToLeague(args) {
  return new Promise(function(resolve, reject) {
    !args.token.titles.includes(args.league)
      ? resolve()
      : reject(new AppErrors.OnlyAcceptUserDoesNotBelongsToCertainLeague());
  });
}

async function checkMatches(args) {
  return new Promise(async function(resolve, reject) {
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
      return resolve({ needed, failed });
    } catch (err) {
      return reject(err);
    }
  });
}

// 檢查賽事是否合法
function isMatchValid(args, ele, filter) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT game.bets_id, game.status,
                home.team_id AS home_id, home.alias_ch AS home_alias_ch, home.alias AS home_alias, 
                away.team_id AS away_id, away.alias_ch AS away_alias_ch, away.alias aS away_alias
           FROM matches AS game,
                match__teams AS home,
                match__teams AS away
          WHERE game.bets_id = :id
            AND game.league_id = ${modules.leagueCodebook(args.league).id}
            AND game.home_id = home.team_id
            AND game.away_id = away.team_id`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { id: ele.id }
        }
      );

      // 若賽事 id 無效，推到 failed；反之，推到 needed
      if (result.length === 0) {
        ele.code = modules.httpStatus.NOT_FOUND;
        ele.error = `Match id: ${ele.id} in ${args.league} not found`;
        filter.failed.push(ele);
      } else {
        addTeamInformation(args, ele, result[0]);
        if (result[0].status !== scheduledStatus) {
          ele.code = modules.httpStatus.FORBIDDEN;
          ele.error = `Match id: ${ele.id} in ${args.league} already started or ended`;
          filter.failed.push(ele);
        } else filter.needed.push(ele);
      }
      resolve(filter);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function addTeamInformation(args, ele, result) {
  ele.home = {
    id: result.home_id,
    alias: result.home_alias,
    alias_ch: result.home_alias_ch
  };
  ele.away = {
    id: result.away_id,
    alias: result.away_alias,
    alias_ch: result.away_alias_ch
  };
  ele.league_id = modules.leagueCodebook(args.league).id;
}
// 檢查盤口是否存在在該使用者的預測單裡
function isHandicapExist(args, i, filter) {
  return new Promise(async function(resolve, reject) {
    const ele = filter.needed[i];
    try {
      const { handicapType, handicapId } = handicapProcessor(ele);

      const result = await db.sequelize.query(
        `SELECT * 
           FROM user__predictions
          WHERE uid = '${args.token.uid}'
            AND bets_id = :id
            AND ${handicapType}_id = '${handicapId}'
            AND sell = ${NORMAL_USER_SELL}
            AND league_id = ${modules.leagueCodebook(args.league).id}`,
        {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { id: ele.id }
        }
      );

      if (!result.length) {
        const error = {
          code: modules.NOT_FOUND,
          error: `${handicapType} id: ${handicapId} in ${args.league} not found`
        };
        filterProcessor(filter, i, error);
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}
// 轉換要查詢哪種盤口種類
function handicapProcessor(ele) {
  const handicapType = ele.spread ? 'spread' : 'totals';
  const handicapId = ele.spread ? ele.spread : ele.totals;
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

function updatePredictions(args, filter) {
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < filter.needed.length; i++) {
        const ele = filter.needed[i];
        const { handicapType, handicapId } = handicapProcessor(ele);
        if (ele.length === undefined) {
          const result = await db.sequelize.query(
            `UPDATE user__predictions
              SET ${handicapType}_id = NULL, ${handicapType}_bets = NULL, ${handicapType}_option = NULL
            WHERE ${handicapType}_id = '${handicapId}'
              AND bets_id = :id
              AND uid = '${args.token.uid}'`,
            {
              type: db.sequelize.QueryTypes.UPDATE,
              replacements: { id: ele.id }
            }
          );
          // result = [undefined, 1] 代表有更新成功；反之 [undefined, 0]
          if (!result[1]) {
            const error = {
              code: modules.httpStatus.ACCEPTED, // 請求接受並處理但可能失敗
              error: `${handicapType} id: ${handicapId} in ${args.league} update failed`
            };
            filterProcessor(filter, i, error);
          }
        }
      }
      return resolve(filter);
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}
// 偵測一般玩家讓分和大小分的下注單是否都為空，若是的話需刪除
function deletePredictionsWhichAreNull(uid, league) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is range, taking 170ms
      await db.sequelize.query(
        `DELETE 
           FROM user__predictions
          WHERE uid = :uid
            AND spread_id IS NULL
            AND totals_id IS NULL
            AND league_id = :league_id`,
        {
          type: db.sequelize.QueryTypes.DELETE,
          replacements: { uid, league_id: modules.leagueCodebook(league).id, raw: true }
        }
      );
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}
function returnData(filter) {
  return new Promise(function(resolve, reject) {
    const neededResult = isNeeded(filter.needed);
    if (!neededResult) {
      return reject(
        new AppErrors.DeletePredictionsFailed({ failed: filter.failed })
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
  delete filter.needed;
  return filter;
}
module.exports = deletePredictions;
