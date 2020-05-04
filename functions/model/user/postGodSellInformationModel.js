const modules = require('../../util/modules');
const AppError = require('../../util/AppErrors');
const db = require('../../util/dbUtil');
const SELL = 1;

function godSellInformation(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const unix = {
        begin: modules.convertTimezone(args.date),
        end:
          modules.convertTimezone(args.date, {
            op: 'add',
            value: 1,
            unit: 'days'
          }) - 1
      };
      await isBeforeScheduled(args, unix);
      await isGodBelongToLeague(args, args.token.customClaims.titles);
      await checkPredictionSell(args, unix);
      args.rank = await getTitleRank(args);
      return resolve(await insertDB(args, unix));
    } catch (err) {
      return reject(err);
    }
  });
}

function isBeforeScheduled(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT scheduled
           FROM matches
          WHERE scheduled BETWEEN ${unix.begin} AND ${unix.end}
            AND league_id = "${modules.leagueCodebook(args.league).id}"
       ORDER BY scheduled DESC
          LIMIT 1`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      const now = modules.moment(args.now).unix();
      now < result[0].scheduled
        ? resolve()
        : reject(new AppError.CouldNotModifySellInformation());
    } catch (err) {
      console.log(err);

      return reject(new AppError.MysqlError());
    }
  });
}

// 檢查是否為該聯盟的大神要填寫售牌資訊
function isGodBelongToLeague(args, titles = []) {
  return new Promise(function(resolve, reject) {
    !titles.includes(args.league)
      ? reject(new AppError.UserNotBelongToGod())
      : resolve();
  });
}
// 檢查該大神該天的販售狀態是否確實為「販售」
function checkPredictionSell(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.query(
        `SELECT sell
           FROM user__predictions AS prediction
          WHERE uid = "${args.token.uid}"
            AND league_id = ${modules.leagueCodebook(args.league).id}
            AND match_scheduled BETWEEN ${unix.begin} AND ${unix.end}
          LIMIT 1`,
        { type: db.sequelize.QueryTypes.SELECT }
      );

      result[0] !== SELL
        ? resolve()
        : reject(new AppError.CouldNotFillInSellInformation());
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}
// 取得該大神的階級
function getTitleRank(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.Title.findOne({
        where: {
          uid: args.token.uid,
          period: modules.getTitlesPeriod(args.now).period,
          league_id: modules.leagueCodebook(args.league).id
        },
        attributes: ['rank_id']
      });
      return resolve(result.rank_id);
    } catch (err) {
      console.error(err);
      return reject(new AppError.MysqlError());
    }
  });
}
async function insertDB(args, unix) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.PredictionDescription.upsert({
        uid: args.token.uid,
        league_id: modules.leagueCodebook(args.league).id,
        rank_id: args.rank,
        day: unix.begin,
        description: args.desc,
        tips: args.tips
      });
      return resolve('Upsert successful');
    } catch (err) {
      return reject(new AppError.MysqlError());
    }
  });
}

module.exports = godSellInformation;
