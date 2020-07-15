const {
  moment, date3UnixInfo, getTitlesPeriod, getTitlesNextPeriod
} = require('../util/modules');
const { zone_tw } = require('../config/env_values');
const settleWinList = require('../model/user/settleWinListModel');
const { redis } = require('../util/redisUtil');

const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub god_settleWinList_A]', util.format(...args));
  }
}

// 2. `每天` `下午5點` 賽事勝注勝率計算 `A部份`

async function god_settleWinList_A() {
  const nowInfo = date3UnixInfo(Date.now());
  const nowYYYYMMDD = nowInfo.dateYYYYMMDD;
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const period = getTitlesPeriod(Date.now());
  const nextPeriod = getTitlesNextPeriod(Date.now());
  const nextPeriodStartDateUnix = moment.tz(nextPeriod.end, 'YYYYMMDD', zone_tw).add(1, 'days').unix();
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');

  log('========== pubsub god_settleWinList_A start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('period: ', period);
  log('nextPeriod: ', nextPeriod);
  log('nextPeriodStartDateUnix: ', nextPeriodStartDateUnix);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);

  //
  // 2. `每天` `下午5點` 賽事勝注勝率計算 `A部份`
  //
  // if (nowHHmm === '1700') {
  log('每天 17:00 賽事勝注勝率計算 run');
  await settleWinList({ token: { uid: '999' }, date: nowYYYYMMDD });
  await redis.specialDel('*titles*', 100);
  await redis.specialDel('*users__win__lists*', 100);
  // }

  log('========== pubsub god_settleWinList_A end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = god_settleWinList_A;
