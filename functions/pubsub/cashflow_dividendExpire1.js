/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { date3UnixInfo, mergeDeep } = require('../util/modules');
const dividendExpireModel = require('../model/cashflow/dividendExpireModel');

const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub cashflow]', util.format(...args));
  }
}

// 3. `清晨 12:00` `這個月第 1 天日期` 更新金流紅利過期、刪除使用者紅利  //`下午 11:59` `這個月 月底`

async function cashflow_dividendExpire1() {
  const nowInfo = date3UnixInfo(Date.now());
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');
  const lastDayOfMonth = nowInfo.mdate.endOf('month').format('DD');

  log('========== pubsub cashflow_dividendExpire1 start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);
  log('lastDayOfMonth: ', lastDayOfMonth);

  //
  // 3. `清晨 12:00` `這個月第 1 天日期`  更新金流紅利過期、刪除使用者紅利  // `下午 11:59` `這個月 月底`
  //
  // 清晨 HHmm 0000
  // if (nowHHmm === '0000' && nowDayOfMonth === '01') {
  log('每天 清晨 12:00 這個月 第 1 天日期 紅利 失效');
  await dividendExpireModel({ method: 'PUT' });
  await dividendExpireModel({ method: 'DELETE' });
  // }

  //
  log('========== pubsub cashflow_dividendExpire1 end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = cashflow_dividendExpire1;
