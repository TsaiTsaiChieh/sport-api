/* eslint-disable prefer-const */
const { moment, dateUnixInfo, settleRefundCoinDividend } = require('../util/modules');
const { getGodSellPredictionWinBetsInfo, createBuy } = require('../util/databaseEngine');
const dividendExpireModel = require('../model/cashflow/dividendExpireModel');
const db = require('../util/dbUtil');
// const to = require('await-to-js').default;
// const errs = require('../util/errorCode');
const { zone_tw } = require('../config/env_values');

const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub cashflow]', util.format(...args));
  }
}

// 1. `每天`  `清晨 05:00` 紅利退款 搞幣退款 ??搞錠退款??
// 2. `每天`  `清晨 12:00` `這個月第 14 天日期` 本月到期紅利
// 3. `每天`  `下午 11:59` `這個月 月底` 更新金流紅利過期、刪除使用者紅利

async function god(req, res) {
  const nowInfo = dateUnixInfo(Date.now());
  const nowUnix = nowInfo.mdate.unix();
  // const nowYYYYMMDD = nowInfo.dateYYYYMMDD;
  // const nowYYYYMMDDUnix = nowInfo.dateBeginUnix;
  // const yesterdayYYYYMMDD = nowInfo.yesterdayYYYYMMDD;
  const yesterdayYYYYMMDDUnix = nowInfo.yesterdayBeginUnix;
  const yesterdayBeginUnix = nowInfo.yesterdayBeginUnix;
  // const yesterdayEndUnix = nowInfo.yesterdayEndUnix;
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const nowDayOfWeek = moment.tz(nowUnix * 1000, zone_tw).isoWeekday();
  const nowDayOfMonth = moment.tz(nowUnix * 1000, zone_tw).format('DD');
  const lastDayOfMonth = moment.tz(nowUnix * 1000, zone_tw).endOf('month').format('DD');

  log('========== pubsub god start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', nowInfo);
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);
  log('lastDayOfMonth: ', lastDayOfMonth);

  let godSellDeckListSettle = {}; // 大神販售預測牌組清單結算使用
  //
  // 1. `每天`  `清晨 05:00` 紅利退款 搞幣退款
  //
  // 清晨 HHmm 0500
  if (nowHHmm === '0500') {
    log('每天 清晨 05:00 紅利 退款  run');

    // 取得 該天那些大神販售預測牌組，那些 User 購買
    // buy_status = 1 已付費
    log('取得該天那些大神販售預測牌組，那些 User 購買  ');
    const godSellDeckList = await db.sequelize.query(`
      select buy_id, uid, god_uid, league_id, buy_status, matches_date
        from user__buys
       where matches_date = :begin
         and buy_status = 1
    `, {
      replacements: {
        begin: yesterdayBeginUnix
      },
      type: db.sequelize.QueryTypes.SELECT
    });

    // 判斷 該大神預測牌組結算是否 >=0  當 "否" 時，把 buy_status 改成 處理中(需區分 一般退款、全額退款)
    log('判斷 該大神預測牌組結算是否 >=0 ');
    const lists = [];
    for (const [index, data] of Object.entries(godSellDeckList)) {
      log('取得 大神預測牌組結算 第  %s筆', index, data.god_uid, data.league_id, yesterdayYYYYMMDDUnix);

      // 如果已經取過就不要再取
      if (godSellDeckListSettle[`${data.uid}${data.league_id}${yesterdayYYYYMMDDUnix}`] !== undefined) continue;

      // 測試模擬資料;
      // const t = [{
      //   buy_id: 67,
      //   uid: 'QztgShRWSSNonhm2pc3hKoPU7Al2',
      //   god_uid: 'Xw4dOKa4mWh3Kvlx35mPtAOX2P52',
      //   league_id: '2274',
      //   date_timestamp: '1593532800',
      //   win_bets: -1, // 1: >= 0   -1: <= 0
      //   matches_fail_status: 1 // -1 全額退款，0 一般退款
      // }];
      const t = await getGodSellPredictionWinBetsInfo(data.god_uid, data.league_id, yesterdayYYYYMMDDUnix);

      t.forEach(function(ele) {
        lists.push(ele);
      });
    }

    for (const data of lists) {
      log(`${data.uid}  ${data.league_id} ${yesterdayYYYYMMDDUnix} ${data.date_timestamp} 注數：${data.win_bets}`);
      godSellDeckListSettle[`${data.uid}${data.league_id}${yesterdayYYYYMMDDUnix}`] = data;

      if (data.win_bets === undefined || data.win_bets >= 0) continue;

      // 否，計算退款比例 按 搞幣+紅利 支付比例退回  會有一定比例`紅利`退回
      const buy_status = data.matches_fail_status === 1 ? -1 : 0; // -1 全額退款，0 一般退款
      const refundInfo = settleRefundCoinDividend(179, 89, 80, 99);

      // coin 搞幣   dividend 紅利
      log(`新增退款資料 到 cashflow_buy buy_id: ${data.buy_id} 使用者id:${data.uid} 退款情況:${buy_status} 退款支付比例:`, refundInfo);
      await createBuy({
        uid: data.uid,
        league_id: data.league_id,
        god_uid: data.god_uid,
        buy_id: data.buy_id,
        matches_date: data.date_timestamp,
        dividend_real: refundInfo.dividend_real,
        dividend: refundInfo.dividend,
        coin_real: refundInfo.coin_real,
        coin: refundInfo.coin,
        status: buy_status
      }, buy_status, 'buy');
    };
  }

  //
  // 2. `每天`  `清晨 12:00` `這個月第 14 天日期` 本月到期紅利
  //
  // 清晨 HHmm 0500
  if (nowHHmm === '0000' && nowDayOfMonth === '14') {
    log('每天 清晨 12:00 這個月第 14 天日期 紅利 提醒');
    await dividendExpireModel({ method: 'POST' });
  }

  //
  // 3. `每天`  `下午 11:59` `這個月 月底` 更新金流紅利過期、刪除使用者紅利
  //
  // 清晨 HHmm 0500
  if (nowHHmm === '2359' && nowDayOfMonth === lastDayOfMonth) {
    log('每天 下午 11:59 這個月 月底 紅利 失效');
    await dividendExpireModel({ method: 'PUT' });
    await dividendExpireModel({ method: 'DELETE' });
  }

  //
  log('========== pubsub god end ==========');
  return res.json({ status: 'ok' });
}

module.exports = god;
