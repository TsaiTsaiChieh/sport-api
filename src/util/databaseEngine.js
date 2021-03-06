const db = require('./dbUtil');
const AppError = require('./AppErrors');
const errs = require('./errorCode');
const to = require('await-to-js').default;
const { coreDateInfo } = require('../util/modules');
const { logger } = require('./loggerUtil');
const modules = require('../util/modules');

function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      // const result = await db.User.findOne(
      //   { where: { uid }, raw: true, include: [{ model: db.User_Blacklist, required: false }] });
      // indexes are const in user & user_blacklists table, taking 165ms
      const result = await db.sequelize.query(
        `SELECT user.id, user.uid AS uid, user.status, user.avatar, user.birthday, user.birthday_tw, user.display_name, user.email, user.name, user.country_code, user.phone, user.point, user.signature, user.fan_count, user.default_title, user.default_god_league_rank, user.accuse_credit, user.block_count, user.unread_count, user.dividend, user.coin, user.ingot, user.invoice_carrier, user.deposit_lottery, user.rank1_count, user.rank2_count, user.rank3_count, user.rank4_count, user.createdAt, user.updatedAt, 
                blacklist.muted_time, blacklist.muted_count, blacklist.bucketed_time, blacklist.bucketed_count, blacklist.banned_time, blacklist.banned_count
           FROM users AS user 
      LEFT JOIN user__blacklists AS blacklist ON user.uid = blacklist.uid
          WHERE user.uid = :uid`, {
          type: db.sequelize.QueryTypes.SELECT,
          replacements: { uid }
        });
      if (!result.length) return reject(new AppError.UserNotFound());
      return resolve(result[0]); // else return user data
    } catch (err) {
      console.log(err);
      return reject(new AppError.UserNotFound(err.stack));
    }
  });
}

function getSeason(league_id) {
  return new Promise(async function(resolve, reject) {
    try {
      // find the first one and return
      const results = await db.Season.findOne({
        where: {
          league_id: league_id,
          current: 1
        },
        attributes: ['season']
      });
      return resolve(results.season);
    } catch (err) {
      return reject(new AppError.GetSeasonError(err.stack));
    }
  });
}

// 檢查使用者權限  rightArr 傳入權限陣列
// rightArr = [1, 2] // 一般使用者, 大神
async function checkUserRight(uid, rightArr = [], source = null) {
  const [err, memberInfo] = await to(db.User.findOne({ where: { uid: uid } }));
  if (err) {
    logger.warn('[Error][databaseEngine][checkUserRight] ', err);
    throw errs.dbErrsMsg('500', '500', err);
  };
  if (!memberInfo) return errs.errsMsg('404', '1301');
  if (!rightArr.includes(memberInfo.status)) return source ? errs.errsMsg('404', source) : errs.errsMsg('404', '1308');
  return {};
}

// 查該大神販售牌組的購牌人數
async function countGodSellPredictionBuyers(god_uid, league_id, matches_date) {
  let fake = 0;
  const [err, counts] = await to(db.UserBuy.count({
    where: {
      god_uid: god_uid,
      league_id: league_id,
      matches_date: matches_date
    }
  }));
  const result = await db.UserBuyFake.findOne({ attributes: ['fake_purchase'], where: { league_id, god_uid, matches_date }, raw: true });
  if (result) fake = result.fake_purchase;

  if (err) {
    logger.warn('[Error][databaseEngine][countGodSellPredictionBuyers] ', err);
    throw errs.dbErrsMsg('500', '500', { custMsg: err });
  };
  return counts + fake;
}

// 檢查該 uid 是否有購買特定大神牌組
// 0: 未購買  1: 有購買  2: 大神看自己的預測牌組
async function checkUidBuyGodSellPrediction(uid, god_uid, league_id, matches_date_unix) {
  if (uid === god_uid) return 2; // 大神看自己的預測牌組

  const [err, counts] = await to(db.UserBuy.count({
    where: {
      uid: uid,
      god_uid: god_uid,
      league_id: league_id,
      matches_date: matches_date_unix
    }
  }));
  if (err) {
    logger.warn('[Error][databaseEngine][checkUidBuyGodSellPrediction] ', err);
    throw errs.dbErrsMsg('500', '500', { custMsg: err });
  };

  if (counts > 1) throw errs.dbErrsMsg('400', '13710', { custMsg: err });
  if (counts === 0) return 0; // 未購買

  return 1; // 有購買
}

// 檢查該大神是否販售預測牌組
async function checkGodSellPrediction(god_uid, league_id, matches_date_unix) {
  const end_unix = coreDateInfo(matches_date_unix).dateEndUnix;
  const [err, counts] = await to(db.Prediction.count({
    where: {
      uid: god_uid,
      league_id: league_id,
      match_scheduled: {
        [db.Op.between]: [matches_date_unix, end_unix]
      },
      sell: 1
    }
  }));
  if (err) {
    logger.warn('[Error][databaseEngine][checkGodSellPrediction] ', err);
    throw errs.dbErrsMsg('500', '500', { custMsg: err });
  };

  if (counts === 0) return false; // 未販售

  return true; // 有販售
}

// 查日期區間大神預測牌組勝注資訊
// await getGodSellPredictionDatesWinBetsInfo('2WMRgHyUwvTLyHpLoANk7gWADZn1', '20200608', '20200608');
// async function getGodSellPredictionDatesWinBetsInfo(uid, sDate, eDate) {
//   const range1 = moment().range(sDate, eDate);
//
//   const dateBetween = [];
//   Array.from(range1.by('day')).forEach(function(data) {
//     dateBetween.push(convertDateYMDToGTM0Unix(data.format('YYYYMMDD')));
//   });
//
//   // 取得 user__buys 購買資料
//   const buyLists = await db.sequelize.query(`
//     select uid, league_id, god_uid, matches_date, buy_status
//       from user__buys
//      where uid = :uid
//        and matches_date in (:dateBetween)
//   `, {
//     replacements: {
//       uid: uid,
//       dateBetween: dateBetween
//     },
//     type: db.sequelize.QueryTypes.SELECT
//   });
//
//   // 取得 該大神預測牌組勝注
//   const result = [];
//   for (const data of buyLists) {
//     const info = await getGodSellPredictionWinBetsInfo(data.god_uid, data.league_id, data.matches_date);
//
//     if (!info.length) continue; // 空陣列移除，不回傳 略過
//
//     result.push({
//       matches_date: data.matches_date,
//       buy_status: data.buy_status,
//       info: info[0] // 這裡預設情況下是只會有一筆，萬一有兩筆時，只存入第一筆
//     });
//   };
//
//   return result;
// }

// 查該大神預測牌組勝注
// matches_fail_status  -1 全額退款，0 一般退款  判斷依據是 預測數 是否等同 預測無效數
// async function getGodSellPredictionWinBetsInfo(god_uid, league_id, matches_date_unix) {
//   const end_unix = coreDateInfo(matches_date_unix).dateEndUnix;
//   const period = getLastPeriod(matches_date_unix * 1000).period;
//
//   const infos = await db.sequelize.query(`
//     select users.uid, users.avatar, users.display_name,
//            titles.period, titles.rank_id, titles.price, titles.sub_price,
//            titles.league_id, titles.name,
//            win_bets, date_timestamp,
//            matches_fail_status
//       from (
//              select uid, avatar, display_name
//                from users
//               where uid = :uid
//            ) users,
//            (
//              select titles.uid, titles.league_id, view__leagues.name,
//                     titles.period, titles.rank_id, ranks.price, ranks.sub_price
//                from titles, user__ranks ranks, view__leagues
//               where titles.rank_id = ranks.rank_id
//                 and titles.league_id = view__leagues.league_id
//                 and uid = :uid
//                 and titles.league_id = :league_id
//                 and period = :period
//            ) titles,
//            (
//              select uid, league_id, win_bets, date_timestamp,
//                     day_of_year, period, week_of_period, week, month, season
//                from users__win__lists__histories
//               where uid = :uid
//                 and league_id = :league_id
//                 and date_timestamp = :begin
//            ) histories,
//            (
//              select all_counts = failed_counts matches_fail_status
//                from (
//                       select count(predictions.id) all_counts
//                         from user__predictions predictions, matches
//                        where predictions.bets_id = matches.bets_id
//                          and predictions.uid = :uid
//                          and predictions.league_id = :league_id
//                          and predictions.match_date = :begin
//                     ) matches_all,
//                     (
//                       select count(predictions.id) failed_counts
//                         from user__predictions predictions, matches
//                        where predictions.bets_id = matches.bets_id
//                          and predictions.uid = :uid
//                          and predictions.league_id = :league_id
//                          and predictions.match_date = :begin
//                          and matches.status < 0
//                     ) matches_failed
//            ) failedcount
//      where users.uid = titles.uid
//        and titles.uid = histories.uid
//   `, {
//     replacements: {
//       uid: god_uid,
//       league_id: league_id,
//       begin: matches_date_unix,
//       end: end_unix,
//       period: period
//     },
//     type: db.sequelize.QueryTypes.SELECT
//   });
//
//   return infos;
// }

async function createData(Data, status, action, inTrans = undefined) {
  const trans = inTrans !== undefined ? inTrans : await db.sequelize.transaction();
  Data.scheduled = modules.moment().unix();
  if (action === 'buy') {
    Data.status = status;
    const [cashflowErr] = await modules.to(db.CashflowBuy.create(Data));
    if (cashflowErr) {
      await trans.rollback();
      throw new AppError.CreateCashflowBuyRollback(`${cashflowErr.stack} by Henry`);
    }
    /* 判斷狀態為沒購牌的話就寫入 */
    if (status === 1) {
      const [purchaseErr] = await modules.to(db.UserBuy.create(Data));
      if (purchaseErr) {
        await trans.rollback();
        throw new AppError.CreateUserBuysTableRollback(`${purchaseErr.stack} by TsaiChieh`);
      }
    /* 狀態為購牌的話就更新 */
    } else {
      const [purchaseErr] = await modules.to(db.UserBuy.update(
        { buy_status: status },
        { where: { buy_id: Data.buy_id } }
      )
      );
      if (purchaseErr) {
        await trans.rollback();
        throw new AppError.CreateUserBuysTableRollback(`${purchaseErr.stack} by TsaiChieh`);
      }
    }

    const purse_self = await db.User.findOne({
      where: { uid: Data.uid },
      attributes: ['ingot', 'coin', 'dividend'],
      raw: true
    });

    const [overageErr] = await modules.to(db.User.update(
      { coin: purse_self.coin - Data.coin, dividend: purse_self.dividend - Data.dividend },
      { where: { uid: Data.uid }, trans }));
    if (overageErr) {
      await trans.rollback();
      throw new AppError.UpdateUserCoinORDividendRollback(`${overageErr.stack} by TsaiChieh`);
    }
  } else if (action === 'sell') {
    Data.status = status;
    const [cashflowErr] = await modules.to(db.CashflowSell.create(Data));
    if (cashflowErr) {
      await trans.rollback();
      throw new AppError.CreateCashflowBuyRollback(`${cashflowErr.stack} by Henry`);
    }
  }
  if (inTrans === undefined) await trans.commit();
  // const test = inTrans !== undefined ? await trans.commit() : '';
}

module.exports = {
  findUser,
  getSeason,
  checkUserRight,
  countGodSellPredictionBuyers,
  checkUidBuyGodSellPrediction,
  checkGodSellPrediction,
  createData
};
