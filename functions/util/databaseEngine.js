const db = require('./dbUtil');
const AppError = require('./AppErrors');
const errs = require('./errorCode');
const to = require('await-to-js').default;

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

// 檢查該 uid 是否有購買大神牌組
async function checkBuyGodSellPrediction(uid, god_uid, league_id, matches_date_unix) {
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
  if (counts === 0) return false; // 未購買

  return true; // 有購買
}

module.exports = {
  findUser,
  getSeason,
  checkUserRight,
  countGodSellPredictionBuyers,
  checkBuyGodSellPrediction
};
