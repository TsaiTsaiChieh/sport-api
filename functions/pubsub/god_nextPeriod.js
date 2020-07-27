const {
  moment, date3UnixInfo, getTitlesPeriod, getTitlesNextPeriod
} = require('../util/modules');
const { zone_tw } = require('../config/env_values');
const settleGodRank = require('../model/user/settleGodRankModel');
const { redis } = require('../util/redisUtil');

const logger = require('firebase-functions/lib/logger');
const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    logger.log('[pubsub god_nextPeriod]', util.format(...args));
  }
}

// 1.  `清晨 12:00` `下期第一天` 產生大神

async function god_nextPeriod() {
  const nowInfo = date3UnixInfo(Date.now());
  const nowUnix = nowInfo.mdate.unix();
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const period = getTitlesPeriod(Date.now());
  const nextPeriod = getTitlesNextPeriod(Date.now());
  const nextPeriodStartDateUnix = moment.tz(nextPeriod.end, 'YYYYMMDD', zone_tw).add(1, 'days').unix();
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');

  log('========== pubsub god_nextPeriod start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('period: ', period);
  log('nextPeriod: ', nextPeriod);
  log('nextPeriodStartDateUnix: ', nextPeriodStartDateUnix);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);

  //
  // 1. 清晨 12:00` `下期第一天` 產生大神
  //
  // 清晨 HHmm 0000
  if (nowUnix === nextPeriodStartDateUnix && nowHHmm === '0000') {
    log('清晨 12:00 下期第一天 產生大神 run');
    await settleGodRank({ token: { uid: '999' } });
    await redis.specialDel('*titles*', 100);
  }

  //
  log('========== pubsub god_nextPeriod end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = god_nextPeriod;
