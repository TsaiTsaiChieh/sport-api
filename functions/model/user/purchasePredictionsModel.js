/* eslint-disable spaced-comment */
const modules = require('../../util/modules');
const dbEngine = require('../../util/databaseEngine');
const db = require('../../util/dbUtil');
const AppErrors = require('../../util/AppErrors');
const SELL = 1;
const PAID = 1;

async function purchasePredictions(args) {
  /* user case: [QztgShRWSSNonhm2pc3hKoPU7Al2]（user phone number is 3）
     want to purchase [Xw4dOKa4mWh3Kvlx35mPtAOX2P52] (god user belong to certain period and league)
     prediction(s) which is(are) in certain date and league */
  // 0. 檢查是否是自己要買自己的牌
  // 1. 檢查購買的大神是否有此使用者且是該聯盟該期的大神 checkGodUserRank
  // 2. 檢查該大神該天有無預測該聯盟賽事且確實是販售狀態 checkGodPredictions
  // 2-1. 檢查開賽時間是否大於購買者的時間，否的話則不能購買 checkBuyTimeBeforeMatchesScheduled
  // 3. 取出使用者紅利和搞幣 getUserDividendAndCoin
  // 4. 檢查購買者想要用紅利折抵嗎 & 紅利+搞幣是否足夠，並回傳餘額(overage) checkUserDepositIsEnough
  // XXX step 5 不要立即寫回，將餘額先存起來
  //// 5. 將餘額寫回 user table updateOverageToUserTable
  //// 6. 將購牌資訊寫進 user__buys table (若購牌資訊未成功寫入，步驟五要 rollback) insertPurchaseToUserBuyTable
  // 5. 重新包裝購買者的購買資訊並回傳(purchaseData) repackagePurchaseData
  // 6. 新增購牌記錄和更新餘額到 user__buys & users table，若失敗要回滾 update transactionsForPurchase
  // Destructuring assignment
  let err, godData, deposit, overage, purchaseData;
  [err] = await modules.to(isTheSameUser(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err, godData] = await modules.to(checkGodUserRank(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err] = await modules.to(checkGodPredictions(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err, deposit] = await modules.to(getUserDividendAndCoin(args));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err, overage] = await modules.to(checkUserDepositIsEnough(args, godData, deposit));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err, purchaseData] = await modules.to(repackagePurchaseData(args, godData));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  [err] = await modules.to(transactionsForPurchase(args, overage, purchaseData));
  if (err) throw new AppErrors.PurchasePredictionsModelError(err.stack, err.status);
  return repackageReturnData(args);
}

function isTheSameUser(args) {
  if (args.token.uid === args.god_uid) throw new AppErrors.CouldNotBuyOwnPredictions();
  return Promise.resolve(true);
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

  const { uid, rank_id } = result[0];
  return { uid, rank_id, period };
}

async function checkGodPredictions(args) {
  const begin = modules.convertTimezone(args.matches_date);
  const end = modules.convertTimezone(args.matches_date, { op: 'add', value: 1, unit: 'days' }) - 1;
  const [err, results] = await modules.to(db.sequelize.query(
    // index is range (user__predictions), taking 165ms
    `SELECT bets_id, match_scheduled
       FROM user__predictions
      WHERE uid = :god_uid
        AND league_id = ':league_id'
        AND match_scheduled BETWEEN ${begin} AND ${end}
        AND SELL = ${SELL}
   ORDER BY match_scheduled DESC
      LIMIT 1`,
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

  if (results[0].match_scheduled <= modules.moment(args.now).unix()) throw new AppErrors.PurchasePredictionsModelError(`因為購買的最晚開賽時間：${modules.convertTimezoneFormat(results[0].match_scheduled, { format: 'YYYY-MM-DD HH:mm' })} 小於購買時間：${modules.convertTimezoneFormat(modules.moment(args.now).unix(), { format: 'YYYY-MM-DD HH:mm' })}`);

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

async function checkUserDepositIsEnough(args, godData, deposit) {
  // coin 搞幣; dividend 紅利
  let { coin, dividend } = deposit;
  const price = modules.godUserPriceTable(godData.rank_id);
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

async function repackagePurchaseData(args, godData) {
  const [getSeasonErr, season] = await modules.to(dbEngine.getSeason(modules.leagueCodebook(args.god_title).id));
  if (getSeasonErr) throw new AppErrors.MysqlError(`${getSeasonErr.stack} by TsaiChieh`);
  const data = {
    uid: modules.validateProperty(args.token, 'uid'),
    league_id: modules.leagueCodebook(args.god_title).id,
    matches_date: modules.convertTimezone(args.matches_date),
    matches_date_tw: modules.convertTimezone(args.matches_date) * 1000,
    god_uid: modules.validateProperty(godData, 'uid'),
    god_rank: modules.validateProperty(godData, 'rank_id'),
    god_period: modules.validateProperty(godData, 'period'),
    day_of_year: Number(modules.moment(modules.convertTimezone(args.matches_date) * 1000).format('DDD')),
    season,
    buy_status: PAID,
    buy_date: modules.moment(args.now).unix(),
    buy_date_tw: args.now.getTime()
  };

  const [err, result] = await modules.to(Promise.resolve(data));
  if (err) throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  return result;
}

async function transactionsForPurchase(args, overage, purchaseData) {
  // First, start a transaction and save it into a variable
  const trans = await db.sequelize.transaction();
  // 寫入購牌紀錄（金流）table designed by Henry
  purchaseData.dividend = overage.dividend;
  purchaseData.dividend_real = overage.dividend;
  purchaseData.coin = overage.coin;
  purchaseData.coin_real = overage.coin;
  const status = PAID;
  await dbEngine.createBuy(Data, Data_status, 'buy');

  // If the execution reaches this line, no errors were thrown, commit the transaction, otherwise, it will show this error: SequelizeDatabaseError: Lock wait timeout exceeded
  await trans.commit();
}

async function repackageReturnData(args) {
  const data = {
    consumer: args.token.uid,
    god_uid: args.god_uid,
    god_league: args.god_title,
    discount: args.discount,
    message: 'success'
  };
  const [err, result] = await modules.to(Promise.resolve(data));

  if (err) throw new AppErrors.RepackageError(`${err.stack} by TsaiChieh`);
  return result;
}
module.exports = purchasePredictions;
