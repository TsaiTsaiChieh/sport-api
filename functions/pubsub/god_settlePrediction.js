const {
  moment, date3UnixInfo, getTitlesPeriod, getTitlesNextPeriod
} = require('../util/modules');
const { getGodSellPredictionWinBetsInfo } = require('../util/databaseEngine');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;
const { zone_tw } = require('../config/env_values');
const settleWinList = require('../model/user/settleWinListModel');
const { redis } = require('../util/redisUtil');

const util = require('util');
function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub god]', util.format(...args));
  }
}

// 5. `每天` `清晨 5:00` 大神預測牌組結算

async function god_settlePrediction() {
  const nowInfo = date3UnixInfo(Date.now());
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

  log('========== pubsub god_settlePrediction start ==========');
  log('Date.now() ', Date.now());
  log('nowInfo: ', JSON.stringify(nowInfo));
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('period: ', period);
  log('nextPeriod: ', nextPeriod);
  log('nextPeriodStartDateUnix: ', nextPeriodStartDateUnix);
  log('nowDayOfWeek: ', nowDayOfWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);

  //
  // 5. `每天` `清晨 5:00` 大神預測牌組結算 是否勝注 >=0
  //
  // if (nowHHmm === '0500') {
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

    if (!data.win_bets || data.win_bets >= 0) continue;

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
  // }

  //
  log('========== pubsub god_settlePrediction end ==========');
  return '{ status: \'ok\' }'; // res.json({ status: 'ok' });
}

module.exports = god_settlePrediction;
