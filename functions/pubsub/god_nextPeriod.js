const {
  moment, date3UnixInfo, getTitlesPeriod, getTitlesNextPeriod
} = require('../util/modules');
const { zone_tw } = require('../config/env_values');
const settleGodRank = require('../model/user/settleGodRankModel');
const settleWinList = require('../model/user/settleWinListModel');
const settleGodTitle = require('../model/user/settleGodTitleModel');
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
  const nextPeriodStartDateUnix = moment.tz(period.end, 'YYYYMMDD', zone_tw).add(1, 'days').unix();
  const nowYYYYMMDD = nowInfo.dateYYYYMMDD;
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');

  log('========== pubsub god_nextPeriod start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowYYYYMMDD: ', nowYYYYMMDD);
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
    // 大神產生之前再次計算一次勝注勝率
    // 原本的方式是固定在 17:00 之後不計算，這樣假設 1/1 ~ 1/14 期間，實際計算是 12/31 17:00 ~ 1/13 17:00
    // 現在變成固定在 1/1 00:00 ~ 1/14 00:00 之間計算
    log('先進行 勝注勝率 計算 run');
    await settleWinList({ token: { uid: '999' }, date: nowYYYYMMDD });
    log('產生大神 run');
    await settleGodRank({ token: { uid: '999' } });
    log('產生大神成就 run');
    await settleGodTitle({ token: { uid: '999' }, period: period.period });
    log('清空 titles Redis Cache run');
    await redis.specialDel('*titles*', 100);
  }

  //
  log('========== pubsub god_nextPeriod end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = god_nextPeriod;
