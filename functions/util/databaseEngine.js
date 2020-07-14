const db = require('./dbUtil');
const AppError = require('./AppErrors');
const errs = require('./errorCode');
const to = require('await-to-js').default;
const { moment, coreDateInfo, getTitlesPeriod, convertDateYMDToGTM0Unix } = require('../util/modules');
const modules = require('../util/modules');
function findUser(uid) {
  return new Promise(async function(resolve, reject) {
    try {
      // index is const, taking 165ms
      const result = await db.User.findOne({ where: { uid }, raw: true });
      if (!result) return reject(new AppError.UserNotFound('by TsaiChieh'));
      return resolve(result); // else return user data
    } catch (err) {
      return reject(new AppError.UserNotFound(`${err.stack} by TsaiChieh`));
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
      return reject(new AppError.MysqlError(`${err.stack} by TsaiChieh`));
    }
  });
}

// 檢查使用者權限  rightArr 傳入權限陣列
// rightArr = [1, 2] // 一般使用者, 大神
async function checkUserRight(uid, rightArr = [], source = null) {
  const [err, memberInfo] = await to(db.User.findOne({ where: { uid: uid } }));
  if (err) {console.error('Error 1. in util/databaseEngine/checkUserRight by YuHsien', err); throw errs.dbErrsMsg('500', '500', err);};
  if (!memberInfo) return errs.errsMsg('404', '1301');
  if (!rightArr.includes(memberInfo.status)) return source ? errs.errsMsg('404', source) : errs.errsMsg('404', '1308');
  return {};
}

// 查該大神販售牌組的購牌人數
async function countGodSellPredictionBuyers(god_uid, league_id, matches_date_unix) {
  const [err, counts] = await to(db.UserBuy.count({
    where: {
      god_uid: god_uid,
      league_id: league_id,
      matches_date: matches_date_unix
    }
  }));
  if (err) {
    console.error('Error 1. in util/databaseEngine/countGodSellPredictionBuyers by YuHsien', err);
    throw errs.dbErrsMsg('500', '500', { custMsg: err });
  };

  return counts;
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
    console.error('Error 1. in util/databaseEngine/checkUidBuyGodSellPrediction by YuHsien', err);
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
    console.error('Error 1. in util/databaseEngine/checkGodSellPrediction by YuHsien', err);
    throw errs.dbErrsMsg('500', '500', { custMsg: err });
  };

  if (counts === 0) return false; // 未販售

  return true; // 有販售
}

// 查日期區間大神預測牌組勝注資訊
// await getGodSellPredictionDatesWinBetsInfo('2WMRgHyUwvTLyHpLoANk7gWADZn1', '20200608', '20200608');
async function getGodSellPredictionDatesWinBetsInfo(uid, sDate, eDate) {
  const range1 = moment().range(sDate, eDate);

  const dateBetween = [];
  Array.from(range1.by('day')).forEach(function(data) {
    dateBetween.push(convertDateYMDToGTM0Unix(data.format('YYYYMMDD')));
  });

  // 取得 user__buys 購買資料
  const buyLists = await db.sequelize.query(`
    select uid, league_id, god_uid, matches_date, buy_status
      from user__buys
     where uid = :uid
       and matches_date in (:dateBetween)
  `, {
    replacements: {
      uid: uid,
      dateBetween: dateBetween
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  // 取得 該大神預測牌組勝注
  const result = [];
  for (const data of buyLists) {
    const info = await getGodSellPredictionWinBetsInfo(data.god_uid, data.league_id, data.matches_date);

    if (!info.length) continue; // 空陣列移除，不回傳 略過

    result.push({
      matches_date: data.matches_date,
      buy_status: data.buy_status,
      info: info[0] // 這裡預設情況下是只會有一筆，萬一有兩筆時，只存入第一筆
    });
  };

  return result;
}

// 查該大神預測牌組勝注
// matches_fail_status  -1 全額退款，0 一般退款  判斷依據是 預測數 是否等同 預測無效數
async function getGodSellPredictionWinBetsInfo(god_uid, league_id, matches_date_unix) {
  const end_unix = coreDateInfo(matches_date_unix).dateEndUnix;
  const period = getTitlesPeriod(matches_date_unix * 1000).period;

  const infos = await db.sequelize.query(`
    select users.uid, users.avatar, users.display_name,
           titles.period, titles.rank_id, titles.price, titles.sub_price,
           titles.league_id, titles.name,
           win_bets, date_timestamp,
           matches_fail_status
      from (
             select uid, avatar, display_name
               from users
              where uid = :uid
           ) users,
           (
             select titles.uid, titles.league_id, view__leagues.name,
                    titles.period, titles.rank_id, ranks.price, ranks.sub_price
               from titles, user__ranks ranks, view__leagues
              where titles.rank_id = ranks.rank_id
                and titles.league_id = view__leagues.league_id
                and uid = :uid
                and titles.league_id = :league_id
                and period = :period
           ) titles,
           (
             select uid, league_id, win_bets, date_timestamp, 
                    day_of_year, period, week_of_period, week, month, season
               from users__win__lists__histories
              where uid = :uid
                and league_id = :league_id
                and date_timestamp = :begin
           ) histories,
           (
             select all_counts = failed_counts matches_fail_status
               from (
                      select count(predictions.id) all_counts
                        from user__predictions predictions, matches
                       where predictions.bets_id = matches.bets_id
                         and predictions.uid = :uid
                         and predictions.league_id = :league_id
                         and predictions.match_date = :begin
                    ) matches_all,
                    (
                      select count(predictions.id) failed_counts
                        from user__predictions predictions, matches
                       where predictions.bets_id = matches.bets_id
                         and predictions.uid = :uid
                         and predictions.league_id = :league_id
                         and predictions.match_date = :begin
                         and matches.status < 0
                    ) matches_failed
           ) failedcount
     where users.uid = titles.uid
       and titles.uid = histories.uid
  `, {
    replacements: {
      uid: god_uid,
      league_id: league_id,
      begin: matches_date_unix,
      end: end_unix,
      period: period
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  return infos;
}

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
    const [overageErr] = await modules.to(db.User.update(
      { coin: Data.coin, dividend: Data.dividend },
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

//
// 任務
//
// 新增 使用者任務 的 預設狀態  1: 領取
// 活動觸發 有些任務 新增 使用者任務 的 預設狀態  2: 已完成
async function addUserMissionStatus(uid, id, status = 1, dateUnix = null) {
  const whereSql = { uid: uid, date_timestamp: dateUnix };
  const defaultSql = { uid: uid, status: status, date_timestamp: dateUnix };

  // 處理 id 可能來源 item or god or deposit
  if (id.mission_item_id) {
    whereSql.mission_item_id = id.mission_item_id;
    defaultSql.mission_item_id = id.mission_item_id;
  }

  if (id.mission_god_id) {
    whereSql.mission_god_id = id.mission_god_id;
    defaultSql.mission_god_id = id.mission_god_id;
  }

  if (id.mission_deposit_id) {
    whereSql.mission_deposit_id = id.mission_deposit_id;
    defaultSql.mission_deposit_id = id.mission_deposit_id;
  }

  if (dateUnix) whereSql.date_timestamp = dateUnix;
  if (dateUnix) defaultSql.date_timestamp = dateUnix;

  // eslint-disable-next-line no-unused-vars
  let err, r, created;

  try {
    [err, [r, created]] = await to(db.UserMission.findOrCreate({
      where: whereSql,
      defaults: defaultSql
    }));
  } catch (e) {console.error('[addUserMissionStatus]', err); throw errs.dbErrsMsg('404', '15110', { addMsg: err.parent.code });}

  // if (!created) {
  //   [err, r] = await to(setUserMissionStatus(uid, id, status, dateUnix));
  //   if (err) {console.error(err); throw errs.dbErrsMsg('404', '15016', { addMsg: err.parent.code });}
  // }
}

// 更新 使用者任務 的 狀態  0: 前往(預設)  1: 領取  2: 已完成
// parms { mission_item_id: ooxx } or { mission_god_id: ooxx } or { mission_deposit_id: ooxx }
// parms status 部份需要特別注意，一些活動(大神產生、購買獎勵) user__missions 是沒有資料的
async function setUserMissionStatus(uid, parms, status, dateUnix = null) {
  const whereSql = { uid: uid };

  if (parms.mission_item_id) whereSql.mission_item_id = parms.mission_item_id;
  if (parms.mission_god_id) whereSql.mission_god_id = parms.mission_god_id;
  if (parms.mission_deposit_id) whereSql.mission_deposit_id = parms.mission_deposit_id;
  if (!parms.mission_item_id && !parms.mission_god_id && !parms.mission_deposit_id) throw errs.errsMsg('404', '15014');

  if (parms.status) whereSql.status = parms.status;
  if (dateUnix) whereSql.date_timestamp = dateUnix;

  const [err, r] = await to(db.UserMission.update({
    status: status
  }, {
    where: whereSql,
    logging: console.log
  }));

  if (err) {console.error(err); throw errs.dbErrsMsg('404', '15010', { addMsg: err.parent.code });}
  return r;
  // if (r[0] !== 1) { throw errs.dbErrsMsg('404', '15012');}
}

/* 發放搞錠 */
async function cashflow_issue(currency, uid){
        uid = '123';
        const ele = {};
        if(!currency.lottery_limit){
          ele.lottery_limit = 1;
        }
        if(!currency.dividend){
          ele.dividend = 0;
        }
        if(!currency.coin){
          ele.coin = 0;
        }
        if(!currency.ingot){
          ele.ingot = 0;
        }
        if(!currency.lottery){
          ele.lottery = 1;
        }

        if(currency.type==1){
          /* 發放搞錠、搞幣、紅利 */
          await db.CashflowMission.create({
            uid             : uid,
            mission_id      : 11,
            mission_item_id : 22,
            ingot           : 10,
            coin            : 0,
            dividend        : 0,
            lottery         : 1
          })
        }else{
          /* 發放抽獎券 */
          const res = await db.CashflowMission.findAndCountAll({
            attributes: [
            'cashflow_mission_id',
            'mission_id',
            'mission_item_id'
            ],
            where: {
            uid:uid
            },
            raw: true
          });

          /* 判斷是否已領取抽獎券上限 */
          const issue_timestamp = modules.moment().unix();
          const status = false;
          if(res.count<ele.lottery_limit){
            await db.CashflowMission.create({
                uid             : 22,
            mission_id          : 1,
            mission_item_id     : 2,
            lottery             : 1,
            issue_timestamp     : issue_timestamp
            })
            status = true;
          }
        }
        return status;
}

module.exports = {
  findUser,
  getSeason,
  checkUserRight,
  countGodSellPredictionBuyers,
  checkUidBuyGodSellPrediction,
  checkGodSellPrediction,
  getGodSellPredictionDatesWinBetsInfo,
  getGodSellPredictionWinBetsInfo,
  createData,
  addUserMissionStatus,
  setUserMissionStatus,
  cashflow_issue
};
