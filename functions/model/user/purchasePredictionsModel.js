const modules = require('../../util/modules');
// const dbEngine = require('../../util/databaseEngine');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const SELL = 1;

async function purchasePredictions(args) {
  /* user case: [QztgShRWSSNonhm2pc3hKoPU7Al2]（user）
     want to purchase [Xw4dOKa4mWh3Kvlx35mPtAOX2P52] (god user belong to certain period and league)
     prediction(s) which is(are) in certain date and league */
  // 1. 檢查購買的大神是否有此使用者且是該聯盟該期的大神 checkGodUserRank
  // 2. 檢查該大神該天有無預測該聯盟賽事且確實是販售狀態，有則取出 checkGodPredictions
  // 3. 取出使用者紅利和搞幣 getUserDividendAndCoin
  // 4. 檢查購買者想要用紅利折抵嗎 & 紅利+搞幣是否足夠，並回傳餘額 checkUserDepositIsEnough
  // Destructuring assignment
  let err, rank, deposit, overage;
  [err, rank] = await modules.to(checkGodUserRank(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err] = await modules.to(checkGodPredictions(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err, deposit] = await modules.to(getUserDividendAndCoin(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err, overage] = await modules.to(checkUserDepositIsEnough(args, rank, deposit));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  return overage;
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
    // index is range (user__predictions), taking 230-600ms
    `SELECT bets_id
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

  return results;
}

async function getUserDividendAndCoin(args) {
  const [err, result] = await modules.to(db.sequelize.query(
    // index is const (users), taking 160ms
    `SELECT dividend, coin
       FROM users
      WHERE uid = :uid`,
    {
      replacements: { uid: args.token.uid },
      type: db.sequelize.QueryTypes.SELECT
    }));

  if (err) throw new AppErrors.MysqlError(`${err.stack} by TsaiChieh`);
  // coin 搞幣; dividend 紅利
  const { coin, dividend } = result[0];
  // error-first callbacks: 當低於銅牌大神的售牌價格
  if (coin + dividend < modules.godUserPriceTable()) throw new AppErrors.CoinOrDividendNotEnough(`[ 搞幣：${coin}；紅利：${dividend} ] by TsaiChieh`);

  return result[0];
}

async function checkUserDepositIsEnough(args, rank, deposit) {
  // coin 搞幣; dividend 紅利
  let { coin, dividend } = deposit;
  const price = modules.godUserPriceTable(rank);
  // if user click discount btn
  if (args.discount) {
    dividend -= price; // 優先扣紅利
    if (dividend < 0) {
      coin += dividend; // 紅利若不夠用，扣搞幣
      dividend = 0; // 且紅利歸零
    }
  }
  // if user did not click discount btn
  if (!args.discount) coin -= price;
  // 若扣完搞幣，搞幣變負值，代表使用者需要再儲值
  if (coin < 0) throw new AppErrors.CoinOrDividendNotEnough(`折抵：${args.discount ? '要' : '不要'} [ 搞幣：${coin}；紅利：${dividend} ] by TsaiChieh`);

  return { coin, dividend };
}

module.exports = purchasePredictions;
