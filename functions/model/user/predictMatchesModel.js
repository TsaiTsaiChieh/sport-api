const modules = require('../../util/modules');
const leagueUtil = require('../../util/leagueUtil');
const AppErrors = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const NORMAL_USER_SELL = -1;
const NORMAL_USER = 1;
const httpStatus = require('http-status');

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
      ? reject(new AppErrors.GodSellStatusWrong())
      : resolve();
  });
}

// 檢查當玩家送出的 sell = 0 or 1，是否屬於該聯盟的大神
function isGodBelongToLeague(args) {
  return new Promise(function(resolve, reject) {
    const { sell, league } = args;
    const { titles } = args.token.customClaims;
    (sell === 0 || sell === 1) && !titles.includes(league)
      ? reject(new AppErrors.UserCouldNotSell())
      : resolve();
  });
}

// 檢查一般玩家，送出的 sell 是否不為 -1
function isNormalUserSell(args) {
  return new Promise(function(resolve, reject) {
    const role = Number.parseInt(args.token.customClaims.role);
    role === NORMAL_USER && args.sell !== NORMAL_USER_SELL
      ? reject(new AppErrors.UserCouldNotSell())
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
    try {
      // index is const(matches-game); const(match__teams-home); const(match__team-away), taking 165ms
      const result = await db.sequelize.query(
        `SELECT game.bets_id, game.status, game.spread_id, game.totals_id, game.scheduled, game.scheduled_tw, 
                home.team_id AS home_id, home.alias_ch AS home_alias_ch, home.alias AS home_alias,  
                away.team_id AS away_id, away.alias_ch AS away_alias_ch, away.alias AS away_alias
           FROM matches AS game, 
                match__teams AS home,
                match__teams AS away
          WHERE game.bets_id = :bets_id
            AND game.home_id = home.team_id
            AND game.away_id = away.team_id`,
        {
          replacements: { bets_id: ele.id },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(checkIfError(result, args, ele, filter));
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function checkIfError(result, args, ele, filter) {
  // 檢查以下三種狀況
  // 1. 賽事 id 無效
  // 2. 盤口已更新
  // 3. 賽事已開打
  const { handicapType, handicapId, handicapName } = handicapProcessor(ele);
  if (!result.length) { // 代表賽事 id 無效
    ele.code = httpStatus.NOT_FOUND;
    ele.error = `Match id: ${ele.id} in ${args.league} not found`;
    ele.error_ch = `無此 ${ele.id} 的賽事編號`;
    filter.failed.push(ele);
    return;
  }
  if (result) {
    if (result[0][`${handicapType}_id`] !== handicapId) { // 盤口已更新
      ele.code = httpStatus.NOT_ACCEPTABLE;
      ele.error = `Match id: ${ele.id} [${handicapType}_id: ${handicapId}] in ${args.league} not acceptable`;
      ele.error_ch = `賽事編號 ${ele.id} 的${handicapName}(handicapType)編號 ${handicapId} 已非最新盤口編號`;
      pushNotValidMatchToFailed(result, args, ele, filter);
      filter.failed.push(ele);
      return;
    }
    if (result[0].status !== leagueUtil.MATCH_STATUS.SCHEDULED) { // 賽事已開打
      ele.code = httpStatus.CONFLICT;
      ele.error = `Match id: ${ele.id} in ${args.league} already started`;
      ele.error_ch = `賽事編號 ${ele.id}(${args.league}) 已經開始或結束，不能再下注`;
      pushNotValidMatchToFailed(result, args, ele, filter);
      filter.failed.push(ele);
      return;
    }
  }
  pushValidMatchToNeeded(result, args, ele, filter);
}

function pushNotValidMatchToFailed(result, args, ele, filter) {
  ele.home = {
    id: result[0].home_id,
    alias: result[0].home_alias,
    alias_ch: result[0].home_alias_ch
  };
  ele.away = {
    id: result[0].away_id,
    alias: result[0].away_alias,
    alias_ch: result[0].away_alias_ch
  };
  ele.league_id = leagueUtil.leagueCodebook(args.league).id;
}

function pushValidMatchToNeeded(result, args, ele, filter) {
  const date = modules.convertTimezoneFormat(result[0].scheduled);
  const match_date = modules.convertTimezone(date);
  ele.match_scheduled = result[0].scheduled;
  ele.match_scheduled_tw = result[0].scheduled_tw;
  ele.match_date = match_date;

  ele.home = {
    id: result[0].home_id,
    alias: result[0].home_alias,
    alias_ch: result[0].home_alias_ch
  };
  ele.away = {
    id: result[0].away_id,
    alias: result[0].away_alias,
    alias_ch: result[0].away_alias_ch
  };
  ele.league_id = leagueUtil.leagueCodebook(args.league).id;
  filter.needed.push(ele);
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
          code: httpStatus.NOT_ACCEPTABLE,
          error: `${handicapType} id: ${handicapId} already exist, locked（大神無法更新已下注內容）`
        };
        filterProcessor(filter, i, error);
      }
      return resolve();
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function handicapProcessor(ele) {
  let handicapType;
  let handicapId;
  let handicapName;

  if (ele.spread) {
    handicapType = 'spread';
    handicapId = ele.spread[0];
    handicapName = '讓分';
  } else if (ele.totals) {
    handicapType = 'totals';
    handicapId = ele.totals[0];
    handicapName = '大小分';
  }
  return { handicapType, handicapId, handicapName };
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
            league_id: leagueUtil.leagueCodebook(args.league).id
          },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      if (results.length) {
        if (results[0].sell !== args.sell) {
          return reject(new AppErrors.GodSellInconsistent());
        } else return resolve();
      } else return resolve();
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

function sendPrediction(args, filter) {
  // console.log(args);
  return new Promise(async function(resolve, reject) {
    const neededResult = isNeeded(filter.needed);
    if (!neededResult) {
      return reject(new AppErrors.UserPredictFailed({ failed: filter.failed }));
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
      return reject(new AppErrors.MysqlError(`${err.stack} by TsaiChieh`));
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

        if (sell === 0) {
          insertData.title = 0;
        }

        insertData.match_scheduled_tw = insertData.matches[0].match_scheduled_tw;
        const record = await db.sequelize.models.user__new.findOne({
          where: {
            league: insertData.league,
            uid: insertData.uid,
            match_scheduled_tw: insertData.match_scheduled_tw
          },
          raw: true
        });
        if (record) {
          await db.sequelize.models.user__new.create(insertData);
        }

        /* 最愛大神加入未讀訊息 */
        const favoriteplayer = await db.User_FavoriteGod.findAll({
          where: {
            uid: insertData.uid
          },
          raw: true
        });
        favoriteplayer.forEach(function(player) {
          db.User.increment('unread_count', { where: { uid: player.god_uid } });
        });
      }
      return resolve({ news_status: 'success' });
    } catch (err) {
      return reject(new AppErrors.MysqlError(`${err.stack} by Henry`));
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
      delete ele.match_scheduled_tw;
      filter.success.push(ele);
    }
  }
  for (let i = 0; i < filter.failed.length; i++) {
    const ele = filter.failed[i];
    if (ele.length === undefined) {
      delete ele.league_id;
      delete ele.match_scheduled;
      delete ele.match_scheduled_tw;
    }
  }
  delete filter.needed;
  return isFailedAndSuccessCoexist(filter);
}

function isFailedAndSuccessCoexist(filter) {
  const { failed, success } = filter;
  if (failed.length && success.length) {
    const userPredictSomeFailed = new AppErrors.UserPredictSomeFailed({ failed, success });
    return {
      error: userPredictSomeFailed.getError.error,
      devcode: userPredictSomeFailed.getError.devcode,
      message: userPredictSomeFailed.getError.message
    };
  } else return { message: filter };
}
module.exports = prematch;
