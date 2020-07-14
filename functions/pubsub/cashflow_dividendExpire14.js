/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { date3UnixInfo } = require('../util/modules');
const dividendExpireModel = require('../model/cashflow/dividendExpireModel');

const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub cashflow]', util.format(...args));
  }
}

// 2. `清晨 12:00` `這個月第 14 天日期` 本月到期紅利

async function cashflow_dividendExpire14() {
  const nowInfo = date3UnixInfo(Date.now());
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');
  const lastDayOfMonth = nowInfo.mdate.endOf('month').format('DD');

  log('========== pubsub cashflow_dividendExpire14 start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);
  log('lastDayOfMonth: ', lastDayOfMonth);

  //
  // 2. `清晨 12:00` `這個月第 14 天日期` 本月到期紅利
  //
  // 清晨 HHmm 1200
  if (nowHHmm === '0000' && nowDayOfMonth === '14') {
    log('每天 清晨 12:00 這個月第 14 天日期 紅利 提醒');
    await dividendExpireModel({ method: 'POST' });
  }

  //
  log('========== pubsub cashflow_dividendExpire14 end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = cashflow_dividendExpire14;
