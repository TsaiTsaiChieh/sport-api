const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function settleMatches(args) {
  return new Promise(async function(resolve, reject) {
    // 1. 管理者才能進行 API 呼叫
    // 2. 該場賽事結算
    // 3. 該場賽事-使用者有下預測單結算

    const userUid = args.token.uid;
    const bets_id = args.bets_id;

    const result = {};

    const s1 = new Date().getTime();
    // 1.
    try {
      const memberInfo = await db.User.findOne({ where: { uid: userUid } });

      if (memberInfo === null) {
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1301')); // ${userUid}
      }

      // !!!! 記得改成 9
      if (!([1, 2].includes(memberInfo.status))) { // 不是 管理者
        // console.error('Error 1. in user/predictonInfoModell by YuHsien');
        return reject(errs.errsMsg('404', '1308'));
      }

      // 改用 modules.userStatusCodebook 這支程式建議 要寫死，不要有 Default 值，因為一般使用者也有一堆權限
      console.log('memberInfo status of statusSwitch: %o', modules.userStatusCodebook(memberInfo.status));
    } catch (err) {
      console.error('Error 1. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const s2 = new Date().getTime();
    // 2.
    try {
      // flag_permatch 1 才為有效賽事
      // status 0 比賽結束
      // home_points、away_points 最終得分 需要有值 (不可null，不可空白)
      const matchInfo = await db.sequelize.query(`
        select bets_id, home_id, away_id, home_points, away_points,
               spread.handicap spread_handicap, home_odd, away_odd,
               totals.handicap totals_handicap, over_odd, under_odd
          from matches
          left join match__spreads spread
            on matches.spread_id = spread.spread_id
          left join match__totals totals
            on matches.totals_id = totals.totals_id
         where bets_id = :bets_id
           and flag_prematch = 1
           and status = 0
           and (home_points is not null and home_points != '')
           and (away_points is not null and away_points != '')
      `, {
        replacements: {
          bets_id: bets_id
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      if (matchInfo.length === 0 || matchInfo.length > 1) {return resolve(`該比賽 ${bets_id} 無相關資料，可能原因 多筆、無效比賽、未完賽、最終得分未寫入資料!`);}

      const mapResult = matchInfo.map(async function(data) {
        const countData = {
          homePoints: data.home_points,
          awayPoints: data.away_points,
          spreadHandicap: data.spread_handicap,
          spreadHomeOdd: data.home_odd,
          spreadAwayOdd: data.away_odd,
          totalsHandicap: data.totals_handicap,
          totalsOverOdd: data.over_odd,
          totalsUnderOdd: data.under_odd
        };

        // null 代表 沒有handicap
        const settelSpreadResult = (data.spread_handicap == null) ? null : settleSpread(countData);
        if (settelSpreadResult === '') return reject(errs.errsMsg('404', '1311')); // 賽事結算讓分 結果不應該為空白

        const settelTotalsResult = (data.totals_handicap == null) ? null : settleTotals(countData);
        if (settelTotalsResult === '') return reject(errs.errsMsg('404', '1312')); // 賽事結算大小 結果不應該為空白

        // 回寫結果
        try {
          const r = await db.Match.update({
            spread_result: settelSpreadResult,
            totals_result: settelTotalsResult
          }, {
            where: {
              bets_id: bets_id
            }
          });

          if (r !== 1) return reject(errs.errsMsg('404', '1310')); // 更新筆數異常

          result[bets_id] = { status: 1, msg: '賽事結算成功！' };
        } catch (err) {
          return reject(errs.errsMsg('404', '1309'));
        }
      });

      await Promise.all(mapResult);
    } catch (err) {
      console.error('Error 2. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const s3 = new Date().getTime();
    // 3.
    try {
      const predictMatchInfo = await db.sequelize.query(`
        select prediction.id, prediction.uid, prediction.spread_option, prediction.totals_option,
               matches.bets_id, home_id, away_id, home_points, away_points,
               spread.spread_id, spread.handicap spread_handicap, home_odd, away_odd,
               totals.totals_id, totals.handicap totals_handicap, over_odd, under_odd
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
           and (home_points is not null and home_points != '')
           and (away_points is not null and away_points != '')
      `, {
        replacements: {
          bets_id: bets_id
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      const mapResult2 = predictMatchInfo.map(async function(data) {
        const countData = {
          homePoints: data.home_points,
          awayPoints: data.away_points,
          spreadHandicap: data.spread_handicap,
          spreadHomeOdd: data.home_odd,
          spreadAwayOdd: data.away_odd,
          totalsHandicap: data.totals_handicap,
          totalsOverOdd: data.over_odd,
          totalsUnderOdd: data.under_odd
        };

        // null 代表 沒有handicap
        const settelSpreadResult = (data.spread_handicap == null) ? null : settleSpread(countData);
        if (settelSpreadResult === '') return reject(errs.errsMsg('404', '1315')); // 賽事結算讓分 結果不應該為空白

        const settelTotalsResult = (data.totals_handicap == null) ? null : settleTotals(countData);
        if (settelTotalsResult === '') return reject(errs.errsMsg('404', '1316')); // 賽事結算大小 結果不應該為空白

        // 計算 讓分開盤結果(spread_result_flag)、大小分開盤結果(totals_result_flag)
        const spreadResultFlag = (data.spread_handicap == null) ? -2 : resultFlag(data.spread_option, settelSpreadResult);
        const totalsResultFlag = (data.totals_handicap == null) ? -2 : resultFlag(data.totals_option, settelTotalsResult);

        // 回寫結果
        try {
          const r = await db.Prediction.update({
            spread_result: settelSpreadResult,
            totals_result: settelTotalsResult,
            spread_result_flag: spreadResultFlag,
            totals_result_flag: totalsResultFlag
          }, {
            where: {
              id: data.id
            }
          });

          if (r !== 1) return reject(errs.errsMsg('404', '1314')); // 更新筆數異常

          result[data.uid] = { user__predictionss_id: data.id, status: 1, msg: '賽事結算成功！' };
        } catch (err) {
          return reject(errs.errsMsg('404', '1313'));
        }
      });

      await Promise.all(mapResult2);
    } catch (err) {
      console.error('Error 3. in user/settleMatchesModel by YuHsien', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    const e = new Date().getTime();
    console.log('1. ', s2 - s1);
    console.log('2. ', s3 - s2);
    console.log('3. ', e - s3);
    return resolve(result);
  });
}

function settleSpread(data) {
  // handciap: 正:主讓客  負:客讓主
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = data.spreadHandicap;
  const homeOdd = data.homeOdd;
  const awayOdd = data.awayOdd;

  // 平盤有兩情況
  // fair 平盤 要計算注數
  // fair2 平盤 不要計算注數
  return handicap
    ? (homePoints - handicap) === awayPoints
      ? (homeOdd !== awayOdd) ? 'fair' : 'fair2'
      : (homePoints - handicap) > awayPoints ? 'home' : 'away'
    : '';
}

function settleTotals(data) {
  // handciap: 正:主讓客  負:客讓主
  const homePoints = data.homePoints;
  const awayPoints = data.awayPoints;

  const handicap = data.totalsHandicap;
  const overOdd = data.overOdd;
  const underOdd = data.underOdd;

  // 平盤有兩情況
  // fair 平盤 要計算注數
  // fair2 平盤 不要計算注數
  return handicap
    ? (homePoints + awayPoints) === handicap
      ? (overOdd !== underOdd) ? 'fair' : 'fair2'
      : (homePoints + awayPoints) > handicap ? 'over' : 'under'
    : '';
}

function resultFlag(option, settelResult) {
  // -2 未結算，-1 輸，0 不算，1 贏，2 平 (一半一半)
  return settelResult === 'fair2'
    ? 0 : settelResult === 'fair'
      ? 2 : settelResult === option
        ? 1 : -1;
}

module.exports = settleMatches;
