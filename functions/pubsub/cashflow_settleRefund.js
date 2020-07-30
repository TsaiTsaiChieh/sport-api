/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { date3UnixInfo, mergeDeep } = require('../util/modules');
const { settleRefundCoinDividend, settleIngot, settleRefundIngot } = require('../util/settleModules');
const { getGodSellPredictionWinBetsInfo, createData } = require('../util/databaseEngine');
const dividendExpireModel = require('../model/cashflow/dividendExpireModel');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;
const errs = require('../util/errorCode');

const logger = require('firebase-functions/lib/logger');
const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    logger.log('[pubsub cashflow_settleRefund]', util.format(...args));
  }
}

// 1. `每天`  `清晨 05:00` 紅利退款 搞幣退款 搞錠正常處理或退款

async function cashflow_settleRefund() {
  const nowInfo = date3UnixInfo(Date.now());
  const yesterdayYYYYMMDDUnix = nowInfo.yesterdayBeginUnix;
  const yesterdayBeginUnix = nowInfo.yesterdayBeginUnix;
  const nowHHmm = nowInfo.mdate.format('HHmm');
  const nowDayOfWeek = nowInfo.mdate.isoWeekday();
  const nowDayOfMonth = nowInfo.mdate.format('DD');
  const lastDayOfMonth = nowInfo.mdate.endOf('month').format('DD');

  log('========== pubsub cashflow_settleRefund start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);
  log('lastDayOfMonth: ', lastDayOfMonth);

  let godSellDeckListSettle = {}; // 大神販售預測牌組清單結算使用

  //
  // 1. `每天`  `清晨 05:00` 紅利退款 搞幣退款 搞錠正常處理或退款
  //
  // 清晨 HHmm 0500
  // if (nowHHmm === '0500') {
  log('每天 清晨 05:00 紅利 退款 搞錠正常處理或退款 run');

  // 取得 該天那些大神販售預測牌組，那些 User 購買
  // user__buys.buy_status = 1 已付費
  // cashflow_buys.status = 1 已付費
  log('取得該天那些大神販售預測牌組，那些 User 購買  ');
  const godSellDeckList = await db.sequelize.query(`
      select buyer.buy_id, buyer.uid, buyer.god_uid, buyer.league_id, 
             buyer.buy_status, buyer.matches_date, 
             ranks.price, ranks.sub_price, cashflow_buys.status,
             cashflow_buys.dividend, cashflow_buys.coin
        from user__buys buyer, cashflow_buys, user__ranks ranks
       where buyer.buy_id = cashflow_buys.buy_id
         and cashflow_buys.status = 1
         and buyer.god_rank = ranks.rank_id
         and buyer.matches_date = :begin
         and buyer.buy_status = 1
    `, {
    replacements: {
      begin: yesterdayBeginUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  // 判斷 該大神預測牌組結算是否 >=0  當 "否" 時，把 buy_status 改成 處理中(需區分 一般退款、全額退款)
  log('判斷 該大神預測牌組結算是否 >0 <=0 ');

  for (const [index, data] of Object.entries(godSellDeckList)) {
    log('取得 大神預測牌組結算 第  %s筆 buy_id: %s ', index, data.buy_id, data.god_uid, data.league_id, yesterdayYYYYMMDDUnix);

    // 如果已經取過就不要再取
    if (godSellDeckListSettle[data.buy_id]) continue;
    godSellDeckListSettle[data.buy_id] = data;

    // 測試模擬資料;
    // const t = [{
    //   buy_id: 67,
    //   uid: 'QztgShRWSSNonhm2pc3hKoPU7Al2',
    //   god_uid: 'Xw4dOKa4mWh3Kvlx35mPtAOX2P52',
    //   league_id: '2274',
    //   date_timestamp: '1593532800',
    //   win_bets: 1,
    //   matches_fail_status: 0, // -1 全額退款，0 一般退款
    //   price: 179,
    //   sub_price: 89,
    //   dividend: 99,
    //   coin: 80
    // }];
    const t = await getGodSellPredictionWinBetsInfo(data.god_uid, data.league_id, yesterdayYYYYMMDDUnix);

    t.forEach(function(ele) {
      godSellDeckListSettle[data.buy_id].win_bets = ele.win_bets;
      godSellDeckListSettle[data.buy_id].matches_fail_status = ele.matches_fail_status;
    });
  }

  //
  // 紅利退款 搞幣退款
  //
  for (const data of Object.values(godSellDeckListSettle)) {
    log(`[紅利][搞幣] ${data.uid}  ${data.league_id} ${yesterdayYYYYMMDDUnix} ${data.matches_date} 注數：${data.win_bets}`);

    if (data.win_bets === undefined || data.win_bets > 0) continue;

    // 否，計算退款比例 按 搞幣+紅利 支付比例退回  會有一定比例`紅利`退回
    const buy_status = data.matches_fail_status === 1 ? -1 : 0; // -1 全額退款，0 一般退款
    const refundInfo = settleRefundCoinDividend(data.price, data.sub_price, data.coin, data.dividend);

    // coin 搞幣   dividend 紅利
    log(`[新增][購牌][退款資料] 到 cashflow_buy buy_id: ${data.buy_id} 使用者id:${data.uid} 退款情況:${buy_status} 退款支付比例:`, refundInfo);
    const [err, r] = await to(createData({
      uid: data.uid,
      league_id: data.league_id,
      god_uid: data.god_uid,
      buy_id: data.buy_id,
      matches_date: data.matches_date,
      dividend_real: refundInfo.dividend_real,
      dividend: refundInfo.dividend,
      coin_real: refundInfo.coin_real,
      coin: refundInfo.coin,
      status: buy_status
    }, buy_status, 'buy'));

    if (err) {logger.warn(errs.dbErrsMsg('404', '50112', { addMsg: err }));}
  };

  // !!! 這裡計算必定要在 紅利退款 搞幣退款 之後
  //
  // 鎬錠
  //
  // win_bets > 0 和 =< 0 兩種情況需要分別處理 正常情況 和 退款情況
  for (const data of Object.values(godSellDeckListSettle)) {
    log(`[搞錠] ${data.uid}  ${data.league_id} ${yesterdayYYYYMMDDUnix} ${data.matches_date} 注數：${data.win_bets}`);
    if (!data.win_bets) continue;

    let createInfo = {
      buy_id: data.buy_id,
      uid: data.uid,
      god_uid: data.god_uid,
      league_id: data.league_id,
      matches_date: data.matches_date
    };

    // cashflow_sell status 1 正常情況
    if (data.win_bets > 0) {
      const Ingotinfo = settleIngot(data.price, data.sub_price);
      log(`[新增][售牌][資料] 到 [cashflow_sell] buy_id: ${data.buy_id} 使用者id:${data.uid} 情況: 1 售牌收入比例:`, Ingotinfo);
      createInfo = mergeDeep(createInfo, {
        ingot_real: Ingotinfo.ingot_real,
        ingot: Ingotinfo.ingot,
        money_real: Ingotinfo.money_real,
        money: Ingotinfo.money,
        status: 1 // 購牌勝注 > 0
      });
    } else {
      //  (data.win_bets =< 0) cashflow_sell status -1, 0 賽事無效, 有退款過
      const buy_status = data.matches_fail_status === 1 ? -1 : 0; // -1 全額退款，0 一般退款
      const refundIngotInfo = settleRefundIngot(data.price, data.sub_price);
      log(`[新增][售牌][退款資料] 到 [cashflow_sell] buy_id: ${data.buy_id} 使用者id:${data.uid} 情況:${buy_status} 售牌收入退款比例:`, refundIngotInfo);
      createInfo = mergeDeep(createInfo, {
        ingot_real: buy_status === -1 ? 0 : refundIngotInfo.ingot_real, // 全額退費(賽事無效) 歸 0
        ingot: buy_status === -1 ? 0 : refundIngotInfo.ingot, // 全額退費(賽事無效) 歸 0
        money_real: buy_status === -1 ? 0 : refundIngotInfo.money_real, // 全額退費(賽事無效) 歸 0
        money: buy_status === -1 ? 0 : refundIngotInfo.money, // 全額退費(賽事無效) 歸 0
        status: buy_status // 全額退費(賽事無效) 和 購牌勝注 <= 0
      });
    }

    const [err, r] = await to(createData(createInfo, createInfo.status, 'sell'));

    if (err) {logger.warn(errs.dbErrsMsg('404', '50114', { addMsg: err }));}
  };
  // }

  //
  log('========== pubsub cashflow_settleRefund end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = cashflow_settleRefund;