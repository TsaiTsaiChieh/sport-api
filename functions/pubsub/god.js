const { moment, convertTimezone, convertTimezoneFormat, getTitlesPeriod, getTitlesNextPeriod } = require('../util/modules');
const { checkGodSellPrediction, getGodSellPredictionWinBetsInfo } = require('../util/databaseEngine');
const db = require('../util/dbUtil');
const to = require('await-to-js').default;
const errs = require('../util/errorCode');
const { zone_tw } = require('../config/env_values');
const settleGodRank = require('../model/user/settleGodRankModel');
const settleWinList = require('../model/user/settleWinListModel');

function log(...args) {
  if (typeof (console) !== 'undefined') {
    console.log('[pubsub god]', ...args);
  }
}

// 1. `每天`  `清晨 12:00` `下期第一天` 產生大神
// 2. `每天` `下午5點` 賽事勝注勝率計算 `A部份`
// 3. `每天` `下午5點` `這個星期的星期一日期` 更新 `上星期` 並清空 `本星期` 設為 0
// 4. `每天` `下午5點` `這個月第一天日期` 更新 ` 上個月`記錄，並清空 `本月`記錄 設為 0
// 5. `每天` `清晨 5:00` 大神預測牌組結算
async function god(req, res) {
  const nowUnix = Math.floor(Date.now() / 1000);
  const nowYYYYMMDD = convertTimezoneFormat(nowUnix);
  const nowYYYYMMDD2 = moment.tz(nowUnix * 1000, zone_tw).format('YYYY-MM-DD'); // YYYY-MM-DD
  const nowYYYYMMDDUnix = convertTimezone(nowYYYYMMDD2);
  const yesterdayUnix = moment(nowUnix * 1000).subtract(1, 'days').unix();
  const yesterdayYYYYMMDD2 = moment.tz(yesterdayUnix * 1000, zone_tw).format('YYYY-MM-DD'); // YYYY-MM-DD
  const nowHHmm = moment.tz(nowUnix * 1000, zone_tw).format('HHmm');
  const period = getTitlesPeriod(Date.now());
  const nextPeriod = getTitlesNextPeriod(Date.now());
  const nextPeriodStartDateUnix = moment(nextPeriod.end, 'YYYYMMDD').add(1, 'days').unix();
  const nowDayofWeek = moment.tz(nowUnix * 1000, zone_tw).isoWeekday();
  const nowDayOfMonth = moment.tz(nowUnix * 1000, zone_tw).format('DD');

  log('========== pubsub god start ==========');
  log('nowUnix: ', nowUnix);
  log('nowYYYYMMDD: ', nowYYYYMMDD);
  log('nowYYYYMMDD2: ', nowYYYYMMDD2);
  log('nowYYYYMMDDUnix: ', nowYYYYMMDDUnix);
  log('yesterdayUnix: ', yesterdayUnix);
  log('yesterdayYYYYMMDD2: ', yesterdayYYYYMMDD2);
  log('nowHHmmss: ', nowHHmm, typeof nowHHmm);
  log('period: ', period);
  log('nextPeriod: ', nextPeriod);
  log('nextPeriodStartDateUnix: ', nextPeriodStartDateUnix);
  log('nowDayofWeek: ', nowDayofWeek);
  log('nowDayOfMonth: ', nowDayOfMonth);

  //
  // 1. `每天`  `清晨 12:00` `下期第一天` 產生大神
  //
  // 清晨 HHmm 0000
  if (nowUnix === nextPeriodStartDateUnix && nowHHmm === '0000') {
    log('每天 清晨 12:00 下期第一天 產生大神 run');
    await settleGodRank();
  }

  //
  // 2. `每天` `下午5點` 賽事勝注勝率計算 `A部份`
  //
  if (nowHHmm === '1700') {
    log('每天 17:00 賽事勝注勝率計算 run');
    await settleWinList({ args: { uid: '999' }, date: nowYYYYMMDD2 });
  }

  //
  // 3. `每天` `下午5點` `這個星期的星期一日期` 更新 `上星期` 並清空 `本星期` 設為 0
  //
  if (nowHHmm === '1700' && nowDayofWeek === 1) {
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
  }

  //
  // 5. `每天` `清晨 5:00` 大神預測牌組結算 是否勝注 >=0
  //
  if (nowHHmm === '0500') {
    log('每天 清晨 05:00 大神預測牌組結算 run');
    log('前日 勝注勝率');
    await settleWinList({ args: { uid: '999' }, date: yesterdayYYYYMMDD2 });
  }

  // const t = await checkGodSellPrediction('vl2qMYWJTnTLbmO4rtN8rxdodCo2', '22000', nowYYYYMMDDUnix);

  // 取得 這期聯盟大神們
  const godLists = await db.sequelize.query(`
      select uid, league_id
        from titles
       where period = :period
    `, {
    replacements: {
      period: period.period
    },
    logging: console.log,
    type: db.sequelize.QueryTypes.SELECT
  });
  log('godLists======', godLists);

  log('更新 user_buys 筆數: ');
  // 判斷 該大神結算是否 >=0  當否時，把 buy_status 改成 處理中(一般退款、全額退款)

  const t2 = await getGodSellPredictionWinBetsInfo('vl2qMYWJTnTLbmO4rtN8rxdodCo2', '22000', 1591200000);
  log(t2);

  //
  log('========== pubsub god end ==========');
  return res.json({ status: 'ok' });
}

module.exports = god;
