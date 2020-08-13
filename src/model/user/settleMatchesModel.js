const { leagueDecoder } = require('../../util/leagueUtil');
const {
  settleSpread, settleSpreadSoccer, settleTotals, settleTotalsSoccer,
  predictionsResultFlag
} = require('../../util/settleModules');
const { checkUserRight } = require('../../util/databaseEngine');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const to = require('await-to-js').default;

// const logger = require('firebase-functions/lib/logger'); // 改用 GAE 後，這個癈掉了
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ]
});
// const d = require('debug')('user:settleMatchesModel'); // firebase 升級後廢掉了
const util = require('util');
function d(...args) {
  if (typeof (console) !== 'undefined') {
    logger.info('[user settleMatchesModel]', util.format(...args));
  }
}

async function settleMatchesModel(args) {
  // 1. 管理者才能進行 API 呼叫
  // 2. 該場賽事結算
  // 3. 該場賽事-使用者有下預測單結算
  // !! 比賽結束跨日，結算要判斷 執行日期 不同 開賽日期，意謂 跨日比賽結束，要重算前天勝率、勝注

  const userUid = args.token.uid;
  const bets_id = args.bets_id;

  const result = {};

  const s1 = new Date().getTime();
  // 1.
  // !!!! 記得改成 9
  const checkResult = await checkUserRight(userUid, [1, 2, 9], '130810');
  if (checkResult.code) throw checkResult;

  const s2 = new Date().getTime();
  // 2.

  // flag_permatch 1 才為有效賽事
  // status 0 比賽結束
  // home_points、away_points 最終得分 需要有值 (不可null，必需 >= 0) 比賽有可能 0:0
  const matchInfo = await db.sequelize.query(`
        select bets_id, matches.league_id, home_id, away_id, home_points, away_points,
               spread.handicap spread_handicap, spread.rate spread_rate, home_odd, away_odd,
               totals.handicap totals_handicap, totals.rate totals_rate, over_odd, under_odd
          from matches
          left join match__spreads spread
            on matches.spread_id = spread.spread_id
          left join match__totals totals
            on matches.totals_id = totals.totals_id
         where bets_id = :bets_id
           and flag_prematch = 1
           and status = 0
           and (home_points is not null and home_points >= 0)
           and (away_points is not null and away_points >= 0)
      `, {
    replacements: {
      bets_id: bets_id
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  if (matchInfo.length !== 1) throw errs.errsMsg('404', '13101', { custMsg: `該比賽 ${bets_id} 無相關資料，可能原因 多筆、無效比賽、未完賽、最終得分未寫入資料!` });

  // const mapResult = matchInfo.map(async function(data) {
  for (const data of matchInfo) {
    const league = leagueDecoder(data.league_id);
    const countData = {
      homePoints: data.home_points,
      awayPoints: data.away_points,
      spreadHandicap: data.spread_handicap,
      spreadRate: data.spread_rate,
      spreadHomeOdd: data.home_odd,
      spreadAwayOdd: data.away_odd,
      totalsHandicap: data.totals_handicap,
      totalsRate: data.totals_rate,
      totalsOverOdd: data.over_odd,
      totalsUnderOdd: data.under_odd
    };

    // null 代表 沒有handicap  -99 代表 延遲轉結束，上面的 sql 有過瀘了
    // eSoccer Soccer 足球 計算方式和其他不同 (不用於 籃球、冰球、棒球等等)
    const settleSpreadResult = (data.spread_handicap == null) ? null
      : ['Soccer', 'eSoccer'].includes(league) ? settleSpreadSoccer(countData) : settleSpread(countData);
    if (settleSpreadResult === '') throw errs.errsMsg('404', '13111'); // 賽事結算讓分 結果不應該為空白

    const settleTotalsResult = (data.totals_handicap == null) ? null
      : ['Soccer', 'eSoccer'].includes(league) ? settleTotalsSoccer(countData) : settleTotals(countData);
    if (settleTotalsResult === '') throw errs.errsMsg('404', '13112'); // 賽事結算大小 結果不應該為空白

    d(bets_id, settleSpreadResult, settleTotalsResult);

    // 回寫結果
    if (settleSpreadResult !== null || settleTotalsResult !== null) {
      const [err, r] = await to(db.Match.update({
        spread_result: settleSpreadResult,
        totals_result: settleTotalsResult
      }, {
        where: {
          bets_id: bets_id
        }
      }));

      if (err) {
        logger.warn('[Error][settleMatchesModel][Match] ', err);
        throw errs.dbErrsMsg('404', '13109', { addMsg: err.parent.code });
      }
      if (r[0] !== 1) throw errs.errsMsg('404', '13110', { custMsg: r }); // 更新筆數異常
    }

    result[bets_id] = { status: 1, msg: '賽事結算成功！' };
  };
  // });

  // await Promise.all(mapResult);

  const s3 = new Date().getTime();
  // 3.
  const predictMatchInfo = await db.sequelize.query(`
        select prediction.id, prediction.league_id, prediction.uid, prediction.spread_option, prediction.totals_option,
               matches.bets_id, home_id, away_id, home_points, away_points,
               spread.spread_id, spread.handicap spread_handicap, spread.rate spread_rate, home_odd, away_odd,
               totals.totals_id, totals.handicap totals_handicap, totals.rate totals_rate, over_odd, under_odd
          from user__predictions prediction
         inner join matches
            on prediction.bets_id = matches.bets_id
          left join match__spreads spread
            on prediction.spread_id = spread.spread_id
          left join match__totals totals
            on prediction.totals_id = totals.totals_id
         where matches.bets_id = :bets_id
           and flag_prematch = 1
           and status = 0
           and (home_points is not null and home_points >= 0)
           and (away_points is not null and away_points >= 0)
      `, {
    replacements: {
      bets_id: bets_id
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  // const mapResult2 = predictMatchInfo.map(async function(data) {
  for (const data of predictMatchInfo) {
    const league = leagueDecoder(data.league_id);
    const countData = {
      homePoints: data.home_points,
      awayPoints: data.away_points,
      spreadHandicap: data.spread_handicap,
      spreadRate: data.spread_rate,
      spreadHomeOdd: data.home_odd,
      spreadAwayOdd: data.away_odd,
      totalsHandicap: data.totals_handicap,
      totalsRate: data.totals_rate,
      totalsOverOdd: data.over_odd,
      totalsUnderOdd: data.under_odd
    };

    // null 代表 沒有handicap  -99 代表 延遲轉結束，上面的 sql 有過瀘了
    const settleSpreadResult = (data.spread_handicap == null) ? null
      : ['Soccer', 'eSoccer'].includes(league) ? settleSpreadSoccer(countData) : settleSpread(countData);
    if (settleSpreadResult === '') throw errs.errsMsg('404', '13215'); // 賽事結算讓分 結果不應該為空白

    const settleTotalsResult = (data.totals_handicap == null) ? null
      : ['Soccer', 'eSoccer'].includes(league) ? settleTotalsSoccer(countData) : settleTotals(countData);
    if (settleTotalsResult === '') throw errs.errsMsg('404', '13216'); // 賽事結算大小 結果不應該為空白

    // 計算 讓分開盤結果(spread_result_flag)、大小分開盤結果(totals_result_flag)
    const spreadResultFlag = (data.spread_handicap == null) ? -2 : predictionsResultFlag(data.spread_option, settleSpreadResult, data.spread_rate);
    const totalsResultFlag = (data.totals_handicap == null) ? -2 : predictionsResultFlag(data.totals_option, settleTotalsResult, data.totals_rate);
    d(bets_id, settleSpreadResult, settleTotalsResult, spreadResultFlag, totalsResultFlag);
    // 回寫結果
    const [err, r] = await to(db.Prediction.update({
      spread_result: settleSpreadResult,
      totals_result: settleTotalsResult,
      spread_result_flag: spreadResultFlag,
      totals_result_flag: totalsResultFlag
    }, {
      where: {
        id: data.id
      }
    }));
    if (err) {
      logger.warn('[Error][settleMatchesModel][Prediction] ', err);
      throw errs.dbErrsMsg('404', '13213', { addMsg: err.parent.code });
    }
    if (r[0] !== 1) throw errs.errsMsg('404', '13214'); // 更新筆數異常

    result[data.uid] = { user__predictionss_id: data.id, status: 1, msg: '賽事結算成功！' };
  };
  // });

  // await Promise.all(mapResult2);

  const e = new Date().getTime();
  console.log('\n settleMatchesModel 1# %o ms   2# %o ms   3#ß %o ms', s2 - s1, s3 - s2, e - s3);
  return result;
}

module.exports = settleMatchesModel;
