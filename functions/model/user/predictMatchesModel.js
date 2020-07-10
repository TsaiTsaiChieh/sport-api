/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
const modules = require('../../util/modules');
const AppError = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const NORMAL_USER_SELL = -1;
const NORMAL_USER = 1;
const scheduledStatus = 2;

function prematch(args) {
  return new Promise(async function(resolve, reject) {
    try {
      // 檢查此使用者身份
      await isGodSellValid(args);
      await isGodBelongToLeague(args);
      await isNormalUserSell(args);
      // 檢查賽事是否合法
      const filter = await checkMatches(args);
      return resolve(await sendPrediction(args, filter));
    } catch (err) {
      return reject(err);
    }
  });
}

function isGodSellValid(args) {
  return new Promise(function(resolve, reject) {
    const { sell, league } = args;
    const { titles } = args.token.customClaims;
    sell === NORMAL_USER_SELL && titles.includes(league)
      ? reject(new AppError.GodSellStatusWrong())
      : resolve();
  });
}

// 檢查當玩家送出的 sell = 0 or 1，是否屬於該聯盟的大神
function isGodBelongToLeague(args) {
  return new Promise(function(resolve, reject) {
    const { sell, league } = args;
    const { titles } = args.token.customClaims;
    (sell === 0 || sell === 1) && !titles.includes(league)
      ? reject(new AppError.UserCouldNotSell())
      : resolve();
  });
}

// 檢查一般玩家，送出的 sell 是否不為 -1
function isNormalUserSell(args) {
  return new Promise(function(resolve, reject) {
    const role = Number.parseInt(args.token.customClaims.role);
    role === NORMAL_USER && args.sell !== NORMAL_USER_SELL
      ? reject(new AppError.UserCouldNotSell())
      : resolve();
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
        if (args.token.customClaims.titles.includes(args.league)) {
          await isGodUpdate(args.token.uid, i, { needed, failed });
          if (needed[i].length === undefined) {
            // 有資料的
            await isGodSellConsistent(args, i, { needed, failed });
          }
        }
      }
      return resolve({ needed, failed });
    } catch (err) {
      return reject(err);
    }
  });
}
async function isMatchValid(args, ele, filter) {
  return new Promise(async function(resolve, reject) {
    const { league } = args;
    const { handicapType, handicapId } = handicapProcessor(ele);

    try {
      // 有無賽事 ID，檢查是否可以下注了（且時間必須在 scheduled 前），盤口 ID 是否是最新的
      const results = await db.sequelize.query(
        `SELECT game.*, 
                home.team_id AS home_id, home.alias_ch AS home_alias_ch, home.alias AS home_alias,  
                away.team_id AS away_id, away.alias_ch AS away_alias_ch, away.alias AS away_alias
           FROM matches AS game, 
                match__teams AS home,
                match__teams AS away
          WHERE game.bets_id = :id
            AND game.${handicapType}_id = :handicapId
            AND game.status = ${scheduledStatus}
            AND game.home_id = home.team_id
            AND game.away_id = away.team_id`,
        {
          replacements: { id: ele.id, handicapId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!results.length) {
        ele.code = 404;
        ele.error = `Match id: ${ele.id} [${handicapType}_id: ${handicapId}] in ${args.league} not acceptable`;
        filter.failed.push(ele);
      } else if (results) {
        const date = modules.convertTimezoneFormat(results[0].scheduled);
        const match_date = modules.convertTimezone(date);
        ele.match_scheduled = results[0].scheduled;
        ele.match_scheduled_tw = results[0].scheduled_tw;
        ele.match_date = match_date;
        ele.home = {
          id: results[0].home_id,
          alias: results[0].home_alias,
          alias_ch: results[0].home_alias_ch
        };
        ele.away = {
          id: results[0].away_id,
          alias: results[0].away_alias,
          alias_ch: results[0].away_alias_ch
        };
        ele.league_id = modules.leagueCodebook(league).id;
        filter.needed.push(ele);
      }
      resolve(filter);
    } catch (err) {
      return reject(new AppError.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function isGodUpdate(uid, i, filter) {
  return new Promise(async function(resolve, reject) {
    const ele = filter.needed[i];
    const { handicapType, handicapId } = handicapProcessor(ele);
    try {
      // index is const, taking 160ms
      const predictResults = await db.sequelize.query(
        `SELECT *
           FROM user__predictions AS prediction
          WHERE prediction.uid = :uid 
            AND prediction.bets_id = ${ele.id} 
            AND ${handicapType}_id = ${handicapId}`,
        {
          replacements: { uid },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (predictResults.length) {
        const error = {
          code: 403,
          error: `${handicapType} id: ${handicapId} already exist, locked`
        };
        filterProcessor(filter, i, error);
      }
      return resolve();
    } catch (err) {
      return reject(new AppError.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function handicapProcessor(ele) {
  let handicapType = '';
  let handicapId;

  if (ele.spread) {
    handicapType = 'spread';
    handicapId = ele.spread[0];
  } else if (ele.totals) {
    handicapType = 'totals';
    handicapId = ele.totals[0];
  }
  return { handicapType, handicapId };
}
function filterProcessor(filter, i, error) {
  const ele = filter.needed[i];
  ele.code = error.code;
  ele.error = error.error;
  delete ele.data;
  filter.needed[i] = []; // clear
  filter.failed.push(ele);
}

function isGodSellConsistent(args, i, filter) {
  return new Promise(async function(resolve, reject) {
    try {
      const ele = filter.needed[i];
      const date = modules.convertTimezoneFormat(ele.match_scheduled);
      const begin = modules.convertTimezone(date);
      const end =
        modules.convertTimezone(date, { op: 'add', value: 1, unit: 'days' }) -
        1;
      // index is range, taking 161ms
      const results = await db.sequelize.query(
        `SELECT prediction.sell
           FROM user__predictions AS prediction
          WHERE prediction.uid = :uid 
            AND prediction.match_scheduled BETWEEN ${begin} AND ${end}
            AND prediction.league_id = :league_id
          LIMIT 1`,
        {
          replacements: {
            uid: args.token.uid,
            league_id: modules.leagueCodebook(args.league).id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      if (results.length) {
        if (results[0].sell !== args.sell) {
          return reject(new AppError.GodSellInconsistent());
        } else return resolve();
      } else return resolve();
    } catch (err) {
      return reject(new AppError.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function sendPrediction(args, filter) {
  return new Promise(async function(resolve, reject) {
    const neededResult = isNeeded(filter.needed);
    if (!neededResult) {
      return reject(new AppError.UserPredictFailed({ failed: filter.failed }));
    } else if (neededResult) {
      await insertDB(args, filter.needed);
      await createNewsDB(args, filter.needed);
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
  return new Promise(async function(resolve, reject) {
    try {
      for (let i = 0; i < needed.length; i++) {
        const ele = needed[i];
        if (ele.length === undefined) {
          const data = repackagePrediction(args, ele);
          const { handicapType, handicapId } = handicapProcessor(ele);
          // 為解決多筆資料會 deadlock 所做的修正
          // upsert return return true -> create
          // upsert return return false -> create update
          const results = await db.Prediction.upsert(data);
          if (results || !results) {
            console.log(
              `User (${
                args.token.customClaims.titles.includes(args.league)
                  ? 'God'
                  : 'Normal'
              }-${args.token.uid}) upsert match id: ${
                ele.id
              } [${handicapType}_id: ${handicapId}] successful`
            );
          }
        }
      }
      return resolve();
    } catch (err) {
      return reject(new AppError.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

async function createNewsDB(insertData, needed) {
  return new Promise(async function(resolve, reject) {
    try {
      insertData.uid = insertData.token.uid;
      /* 讀取售牌金額 */
      const date = new Date();
      const period = modules.getTitlesPeriod(date).period;
      const sell = insertData.sell;
      let price = 0;
      if (sell === 0 || sell === 1) {
        const price_data = await db.sequelize.query(`
            SELECT * FROM user__ranks ur INNER JOIN titles t ON t.rank_id=ur.rank_id WHERE uid = :uid AND period = :period LIMIT 1
        `,
        {
          replacements: { uid: insertData.token.uid, period: period },
          type: db.sequelize.QueryTypes.SELECT
        });
        price = price_data[0].price;
      

      insertData.title = price;
      insertData.scheduled = modules.moment().unix();
      insertData.sort = 2;// 售牌
      await db.sequelize.models.user__new.create(insertData);
      }
      return resolve({ news_status: 'success' });
    } catch (err) {
      return reject(new AppError.MysqlError(`${err.stack} by Henry`));
    }
  });
}

function repackagePrediction(args, ele) {
  const data = {
    bets_id: ele.id,
    league_id: ele.league_id,
    sell: args.sell,
    match_scheduled: ele.match_scheduled,
    match_scheduled_tw: ele.match_scheduled_tw,
    match_date: ele.match_date,
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
  for (let i = 0; i < filter.failed.length; i++) {
    const ele = filter.failed[i];
    if (ele.length === undefined) {
      delete ele.league_id;
      delete ele.match_scheduled;
    }
  }
  delete filter.needed;
  return filter;
}
module.exports = prematch;
