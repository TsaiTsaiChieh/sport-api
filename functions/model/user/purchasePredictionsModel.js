const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const SELL = 1;
// const to = require('await-to-js').default;

async function purchasePredictions(args) {
  /* user case: [QztgShRWSSNonhm2pc3hKoPU7Al2]（user）
     want to purchase [Xw4dOKa4mWh3Kvlx35mPtAOX2P52] (god user belong to certain period and league)
     prediction(s) which is(are) in certain date and league */
  // 1. 檢查購買的大神是否有此使用者且是該聯盟該期的大神 checkGodUserRank
  // 2. 檢查該大神該天有無預測該聯盟賽事且確實是販售狀態 checkGodPredictions
  // 3. 檢查購買者要不要使用紅利，要的話要檢查紅利是否足夠 checkUserDiscountIsEnough
  // Destructuring assignment
  let err, rank, predictions;
  [err, rank] = await modules.to(checkGodUserRank(args));
  [err] = await modules.to(checkGodPredictions(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(`${err.stack} by TsaiChieh`);
  return predictions;
}

async function checkGodUserRank(args) {
  const { period } = modules.getTitlesPeriod(args.now);
  const [err, result] = await modules.to(db.sequelize.query(
    // index is const (users); index_merge (titles), taking 165ms
    `SELECT users.uid, titles.rank_id
       FROM users
  LEFT JOIN titles ON users.uid = titles.uid
      WHERE users.uid = :god_uid
        AND titles.league_id = :league_id
        AND titles.period = :period`,
    {
      replacements: {
        god_uid: args.god_uid,
        league_id: modules.leagueCodebook(args.god_title).id,
        period
      },
      type: db.sequelize.QueryTypes.SELECT
    }));

  if (err) throw new AppErrors.MysqlError(`${err.stack} by TsaiChieh`);
  if (!result.length) throw new AppErrors.GodUserNotFound('by TsaiChieh');
  return result[0].rank_id;
}

async function checkGodPredictions(args) {
  const begin = modules.convertTimezone(args.matches_date);
  const end = modules.convertTimezone(args.matches_date, { op: 'add', value: 1, unit: 'days' }) - 1;
  const [err, results] = await modules.to(db.sequelize.query(
    `SELECT *
       FROM user__predictions
      WHERE uid = :god_uid
        AND league_id = ':league_id'
        AND match_scheduled BETWEEN ${begin} AND ${end}
        AND SELL = ${SELL}`,
    {
      replacements: {
        god_uid: args.god_uid,
        league_id: modules.leagueCodebook(args.god_title).id
      },
      type: db.sequelize.QueryTypes.SELECT
    }));
  if (err) throw new AppErrors.MysqlError(`${err.stack} by TsaiChieh`);
  // Although the error in underline will happen when the null result, but it also will be caught by the err variable by the calling function, i.e. purchasePredictions
  if (!results.length) throw new AppErrors.GodUserDidNotSell(`${args.god_title} (${args.matches_date})`);
}

module.exports = purchasePredictions;
