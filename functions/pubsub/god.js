const {
  moment, date3UnixInfo, getTitlesPeriod, getTitlesNextPeriod
} = require('../util/modules');
const { getGodSellPredictionWinBetsInfo } = require('../util/databaseEngine');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;
const errs = require('../util/errorCode');
const { zone_tw } = require('../config/env_values');
const settleGodRank = require('../model/user/settleGodRankModel');
const settleWinList = require('../model/user/settleWinListModel');
const { redis } = require('../util/redisUtil');

const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub god]', util.format(...args));
  }
}

// 1. `每天`  `清晨 12:00` `下期第一天` 產生大神
// 2. `每天` `下午5點` 賽事勝注勝率計算 `A部份`
// 3. `每天` `下午5點` `這個星期的星期一日期` 更新 `上星期` 並清空 `本星期` 設為 0
// 4. `每天` `下午5點` `這個月第一天日期` 更新 ` 上個月`記錄，並清空 `本月`記錄 設為 0
// 5. `每天` `清晨 5:00` 大神預測牌組結算
async function god(req, res) {
  const nowInfo = date3UnixInfo(Date.now());
  const nowUnix = nowInfo.mdate.unix();
  const nowYYYYMMDD = nowInfo.dateYYYYMMDD;
  // const nowYYYYMMDDUnix = nowInfo.dateBeginUnix;
  const yesterdayYYYYMMDD = nowInfo.yesterdayYYYYMMDD;
  const yesterdayYYYYMMDDUnix = nowInfo.yesterdayBeginUnix;
  const yesterdayBeginUnix = nowInfo.yesterdayBeginUnix;
  const yesterdayEndUnix = nowInfo.yesterdayEndUnix;
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const period = getTitlesPeriod(Date.now());
  const nextPeriod = getTitlesNextPeriod(Date.now());
  const nextPeriodStartDateUnix = moment.tz(nextPeriod.end, 'YYYYMMDD', zone_tw).add(1, 'days').unix();
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');

  log('========== pubsub god start ==========');
  log(Date.now());
  log(nowInfo);
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('period: ', period);
  log('nextPeriod: ', nextPeriod);
  log('nextPeriodStartDateUnix: ', nextPeriodStartDateUnix);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);

  //
  // 1. `每天`  `清晨 12:00` `下期第一天` 產生大神
  //
  // 清晨 HHmm 0000
  if (nowUnix === nextPeriodStartDateUnix && nowHHmm === '0000') {
    log('每天 清晨 12:00 下期第一天 產生大神 run');
    await settleGodRank();
    await redis.specialDel('*titles*', 100);
  }

  //
  // 2. `每天` `下午5點` 賽事勝注勝率計算 `A部份`
  //
  if (nowHHmm === '1700') {
    log('每天 17:00 賽事勝注勝率計算 run');
    await settleWinList({ args: { uid: '999' }, date: nowYYYYMMDD });
    await redis.specialDel('*titles*', 100);
    await redis.specialDel('*users__win__lists*', 100);
  }

  //
  // 3. `每天` `下午5點` `這個星期的星期一日期` 更新 `上星期` 並清空 `本星期` 設為 0
  //
  if (nowHHmm === '1700' && nowDayOfWeek === 1) {
    log('每天 17:00 這這個星期的星期一日期 更新 上星期記錄，並清空 本星期記錄 設為 0 run');

    const [err, r] = await to(db.sequelize.query(`
      update users__win__lists 
         set last_week_win_bets = this_week_win_bets,
             last_week_win_rate = this_week_win_rate,
             last_week_correct_counts = this_week_correct_counts,
             last_week_fault_counts = this_week_fault_counts
    `, { type: db.sequelize.QueryTypes.UPDATE }));

    log('更新 users__win__lists 筆數: ', r);
    if (err) {console.error(err); console.error(errs.dbErrsMsg('404', '50010', { addMsg: err.parent.code }));}

    const [err2, r2] = await to(db.sequelize.query(`
      update users__win__lists 
         set this_week_win_bets = 0,
             this_week_win_rate = 0,
             this_week_correct_counts = 0,
             this_week_fault_counts = 0
    `, { type: db.sequelize.QueryTypes.UPDATE }));

    log('更新 users__win__lists 筆數: ', r2);
    if (err) {console.error(err2); console.error(err2.dbErrsMsg('404', '50010', { addMsg: err.parent.code }));}

    await redis.specialDel('*titles*', 100);
    await redis.specialDel('*users__win__lists*', 100);
  }

  //
  // 4. `每天` `下午5點` `這個月第一天日期` 更新 ` 上個月`記錄，並清空 `本月`記錄 設為 0
  //
  if (nowHHmm === '1700' && nowDayOfMonth === '01') {
    log('每天 17:00 這個月第一天日期 更新 上個月記錄，並清空 本月記錄 設為 0 run');

    const [err, r] = await to(db.sequelize.query(`
      update users__win__lists 
         set last_month_win_bets = this_month_win_bets,
             last_month_win_rate = this_month_win_rate,
             last_month_correct_counts = this_month_correct_counts,
             last_month_fault_counts = this_month_fault_counts
    `, { type: db.sequelize.QueryTypes.UPDATE }));

    log('更新 users__win__lists 筆數: ', r);
    if (err) {console.error(err); console.error(errs.dbErrsMsg('404', '50011', { addMsg: err.parent.code }));}

    const [err2, r2] = await to(db.sequelize.query(`
      update users__win__lists 
         set this_month_win_bets = 0,
             this_month_win_rate = 0,
             this_month_correct_counts = 0,
             this_month_fault_counts = 0
    `, { type: db.sequelize.QueryTypes.UPDATE }));

    log('更新 users__win__lists 筆數: ', r2);
    if (err) {console.error(err2); console.error(err2.dbErrsMsg('404', '50011', { addMsg: err.parent.code }));}

    await redis.specialDel('*titles*', 100);
    await redis.specialDel('*users__win__lists*', 100);
  }

  //
  // 5. `每天` `清晨 5:00` 大神預測牌組結算 是否勝注 >=0
  //
  if (nowHHmm === '0500') {
    log('每天 清晨 05:00 大神預測牌組結算 run');
    log('前日 勝注勝率');
    await settleWinList({ token: { uid: '999' }, date: yesterdayYYYYMMDD });

    // 取得 這期聯盟大神們 昨日 有售牌
    log('取得 這期聯盟大神們 昨日 有售牌 ');
    const godLists = await db.sequelize.query(`
      select distinct titles.uid, titles.league_id
        from titles, user__predictions predictions
       where titles.uid = predictions.uid
         and titles.league_id = predictions.league_id
         and titles.period = :period
         and predictions.match_scheduled between :begin and :end
         and predictions.sell = 1
    `, {
      replacements: {
        begin: yesterdayBeginUnix,
        end: yesterdayEndUnix,
        period: period.period
      },
      type: db.sequelize.QueryTypes.SELECT
    });

    // 判斷 該大神預測牌組結算是否 >=0  當 "否" 時，把 buy_status 改成 處理中(需區分 一般退款、全額退款)
    log('判斷 該大神預測牌組結算是否 >=0 ');
    const lists = [];
    for (const [index, data] of Object.entries(godLists)) {
      log('取得 大神預測牌組結算 ', index, data.uid, data.league_id, yesterdayYYYYMMDDUnix);
      const t = await getGodSellPredictionWinBetsInfo(data.uid, data.league_id, yesterdayYYYYMMDDUnix);
      t.forEach(function(ele) {
        lists.push(ele);
      });
    }

    for (const data of lists) {
      log(data.uid, data.league_id, yesterdayYYYYMMDDUnix, data.date_timestamp, data.win_bets);

      if (data.win_bets === undefined || data.win_bets >= 0) continue;

      // 否，把 buy_status 改成 處理中(需區分 一般退款、全額退款)
      const buy_status = data.matches_fail_status === 1 ? -1 : 0; // -1 全額退款，0 一般退款

      const [err, r] = await to(db.UserBuy.update({
        buy_status: buy_status
      }, {
        where: {
          god_uid: data.uid,
          league_id: data.league_id,
          matches_date: data.date_timestamp
        }
      }));
      if (err) {console.error(err); console.error(err.dbErrsMsg('404', '50110', { addMsg: err.parent.code }));}
      if (r > 0) log('更新 user_buys 筆數: ', r);
    };

    await redis.specialDel('*user__buys*', 100);
  }

  //
  log('========== pubsub god end ==========');
  return res.json({ status: 'ok' });
}

module.exports = god;
