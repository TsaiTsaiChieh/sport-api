const db = require('./dbUtil');
const AppError = require('./AppErrors');
const errs = require('./errorCode');
const to = require('await-to-js').default;
const { dateUnixInfo, getTitlesPeriod } = require('../util/modules');

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
  if (memberInfo === null) return errs.errsMsg('404', '1301');
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
async function checkBuyGodSellPrediction(uid, god_uid, league_id, matches_date_unix) {
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
    console.error('Error 1. in util/databaseEngine/checkBuyGodSellPrediction by YuHsien', err);
    throw errs.dbErrsMsg('500', '500', { custMsg: err });
  };

  if (counts > 1) throw errs.dbErrsMsg('400', '13710', { custMsg: err });
  if (counts === 0) return 0; // 未購買

  return 1; // 有購買
}

// 檢查該大神是否販售預測牌組
async function checkGodSellPrediction(god_uid, league_id, matches_date_unix) {
  const end_unix = dateUnixInfo(matches_date_unix).dateEndUnix;
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

// 檢查該大神預測牌組勝注
async function getGodSellPredictionWinBetsInfo(god_uid, league_id, matches_date_unix) {
  const end_unix = dateUnixInfo(matches_date_unix).dateEndUnix;
  const period = getTitlesPeriod(matches_date_unix * 1000).period;

  const infos = await db.sequelize.query(`
    select users.uid, users.avatar, users.display_name,
           titles.period, titles.rank_id, titles.price, titles.sub_price,
           histories.league_id,
           win_bets, date_timestamp,
           matches_fail_status
      from (
             select uid, avatar, display_name
               from users
              where uid = :uid
           ) users,
           (
             select titles.uid, titles.period, titles.rank_id, ranks.price, ranks.sub_price
               from titles, user__ranks ranks
              where titles.rank_id = ranks.rank_id
                and uid = :uid
                and league_id = :league_id
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
                         and predictions.match_scheduled between :begin and :end
                    ) matches_all,
                    (
                      select count(predictions.id) failed_counts
                        from user__predictions predictions, matches
                       where predictions.bets_id = matches.bets_id
                         and predictions.uid = :uid
                         and predictions.league_id = :league_id
                         and predictions.match_scheduled between :begin and :end
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
    type: db.sequelize.QueryTypes.SELECT,
    logging: console.log
  });

  return infos;
}

module.exports = {
  findUser,
  getSeason,
  checkUserRight,
  countGodSellPredictionBuyers,
  checkBuyGodSellPrediction,
  checkGodSellPrediction,
  getGodSellPredictionWinBetsInfo
};
