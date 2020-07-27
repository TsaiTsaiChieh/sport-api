const {
  moment, date3UnixInfo, getTitlesPeriod, getTitlesNextPeriod
} = require('../util/modules');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;
const errs = require('../util/errorCode');
const { zone_tw } = require('../config/env_values');
const { redis } = require('../util/redisUtil');

const logger = require('firebase-functions/lib/logger');
const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    logger.log('[pubsub god_1OfWeek]', util.format(...args));
  }
}

// 3. `每天` `下午5點` `這個星期的星期一日期` 更新 `上星期` 並清空 `本星期` 設為 0

async function god_1OfWeek() {
  const nowInfo = date3UnixInfo(Date.now());
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const period = getTitlesPeriod(Date.now());
  const nextPeriod = getTitlesNextPeriod(Date.now());
  const nextPeriodStartDateUnix = moment.tz(nextPeriod.end, 'YYYYMMDD', zone_tw).add(1, 'days').unix();
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');

  log('========== pubsub god_1OfWeek start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('period: ', period);
  log('nextPeriod: ', nextPeriod);
  log('nextPeriodStartDateUnix: ', nextPeriodStartDateUnix);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);

  //
  // 3. `每天` `下午5點` `這個星期的星期一日期` 更新 `上星期` 並清空 `本星期` 設為 0
  //
  // if (nowHHmm === '1700' && nowDayOfWeek === 1) {
  log('每天 17:00 這這個星期的星期一日期 更新 上星期記錄，並清空 本星期記錄 設為 0 run');

  const [err, r] = await to(db.sequelize.query(`
      update users__win__lists 
         set last_week_win_bets = this_week_win_bets,
             last_week_win_rate = this_week_win_rate,
             last_week_correct_counts = this_week_correct_counts,
             last_week_fault_counts = this_week_fault_counts
    `, { type: db.sequelize.QueryTypes.UPDATE }));

  log('更新 users__win__lists 筆數: ', r);
  if (err) {logger.warn(err); logger.warn(errs.dbErrsMsg('404', '50010', { addMsg: err.parent.code }));}

  const [err2, r2] = await to(db.sequelize.query(`
      update users__win__lists 
         set this_week_win_bets = 0,
             this_week_win_rate = 0,
             this_week_correct_counts = 0,
             this_week_fault_counts = 0
    `, { type: db.sequelize.QueryTypes.UPDATE }));

  log('更新 users__win__lists 筆數: ', r2);
  if (err) {logger.warn(err2); logger.warn(err2.dbErrsMsg('404', '50010', { addMsg: err.parent.code }));}

  await redis.specialDel('*titles*', 100);
  await redis.specialDel('*users__win__lists*', 100);
  // }

  //
  log('========== pubsub god_1OfWeek end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = god_1OfWeek;
