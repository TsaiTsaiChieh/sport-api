const { getTitlesPeriod, groupsByOrdersLimit } = require('../../util/modules');
const db = require('../../util/dbUtil');

let allLogs = [];
let logT = {};
let logNum = -1;
const isEmulator = process.env.FUNCTIONS_EMULATOR;
const logger = require('firebase-functions/lib/logger');
// const d = require('debug')('user:settleWinListModel'); // firebase 升級後廢掉了
const util = require('util');
function d(...args) {
  if (typeof (console) !== 'undefined') {
    if (isEmulator) { console.log(util.format(...args)); return; }
    if (util.format(...args) === '\n g') { logNum++; logT = {}; return;} // log group 收集起點(起算點)
    if (util.format(...args) === '\n gs') { logNum = -1; allLogs = []; logT = {}; return;} // log group 切斷點(實際logger結束)
    logT[Object.keys(logT).length] = util.format(...args).replace(/\'/g, '');
    allLogs[logNum] = logT;
  }
}

async function settleGodRank() {
  // 兩週審核一次 , 週一更新  周日早上 00:00 計算
  // 同時在同一聯盟得到鑽石大神及金銀銅大神，以鑽石大神為主
  // 鑽大神 5位
  // 1. 第一週最少 10 注, 兩週總數至少 30 注
  // 2. 贏為正數, 輸為負數, 該聯盟注數正負相加之總和, 至少 >= 5
  // 3. 如有相同數值者會先以 兩週注數量 為排名判斷
  // 4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  // 5. 再有相同者, 下注機率的排名
  // 6. 預防再有重複，新增最後一筆下注時間判斷?

  // 金 銀 銅 各10位
  // 1. 第一週最少 10 注, 兩週總數至少 30 注
  // 2. 下注機率至少超過 60% 的勝率
  // 3. 如有相同機率者會先以 兩週注數量 為排名判斷
  // 4. 再有相同者, 以該聯盟 下注總注數 為排名判斷
  // 5. 再有相同者, 該聯盟注數正負相加之總和排名
  // 6. 預防再有重複，新增最後一筆下注時間判斷?

  const now = new Date();
  const period = getTitlesPeriod(now).period - 1;
  // const period_date = getTitlesPeriod(now).date;
  const diamondList = [];
  const goldList = [];
  const sliverList = [];
  const copperList = [];
  const Limit = {
    Diamond: {
      num: 5, // 錄取幾位
      WinBetsLimit: 5 // 錄取條件
    },
    Gold: {
      num: 10,
      WinRateLimit: 0.6
    },
    Sliver: {
      num: 10,
      WinRateLimit: 0.6
    },
    Copper: {
      num: 10,
      WinRateLimit: 0.6
    }
  };
  const godLeagueLimit = [
    { league_id: 11235, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 1298, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 1714, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 1926, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 2148, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 22000, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 2274, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 2319, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 244, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 2759, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 347, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 349, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 3939, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 4412, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 8, first_week_win_handicap: 10, this_period_win_handicap: 30 },
    { league_id: 8251, first_week_win_handicap: 10, this_period_win_handicap: 30 }
  ];

  // const limitMin = getMin(godLeagueLimit);
  // d('limitMin: ===========', limitMin);

  // 依照各聯盟大神 該期第一星期盤數 和 該期盤數 且 限制產生對應的 SQL條件
  // ( league_id = '11235' and first_week_win_handicap >= 10 and this_period_win_handicap >= 30 ) OR
  const limitArr = [];
  godLeagueLimit.forEach(function(data) {
    limitArr.push(` ( league_id = '${data.league_id}' and first_week_win_handicap >= ${data.first_week_win_handicap} and this_period_win_handicap >= ${data.this_period_win_handicap} ) `);
  });
  const limitSQL = limitArr.join(' OR ');

  let preGods = await db.sequelize.query(`
    select *
      from (
              SELECT uid, league_id, this_period_win_bets, this_period_win_rate,
                     (
                        SELECT SUM(correct_counts + fault_counts)
                          FROM users__win__lists__histories uwlh
                         WHERE uwl.league_id = uwlh.league_id
                           AND uwlh.uid = uwl.uid
                           AND period  = :period
                           AND week_of_period = 1
                     ) first_week_win_handicap,
                     (
                        SELECT SUM(correct_counts + fault_counts)
                          FROM users__win__lists__histories uwlh
                         WHERE uwl.league_id = uwlh.league_id
                           AND uwlh.uid = uwl.uid
                           AND period  = :period
                     ) this_period_win_handicap,
                     (
                        SELECT SUM(correct_counts + fault_counts)
                          FROM users__win__lists__histories uwlh
                         WHERE uwl.league_id = uwlh.league_id
                           AND uwlh.uid = uwl.uid
                     ) this_league_win_handicap 
                FROM users__win__lists uwl
               GROUP BY uid, league_id
           ) pregod
     where ( this_period_win_bets >= :diamondWinBetsLimit or this_period_win_rate >= :gscWinRateLimit )
       and ( ${limitSQL} )
     ORDER BY league_id, first_week_win_handicap, this_period_win_handicap, this_league_win_handicap ASC
  `, {
    replacements: {
      period: period,
      diamondWinBetsLimit: Limit.Diamond.WinBetsLimit,
      gscWinRateLimit: Limit.Gold.WinRateLimit
    },
    type: db.sequelize.QueryTypes.SELECT,
    logging: true
  });

  // 使用假大神合格資料進行開發測試，假大神資料可以先在 正式 DB 執行上面的 SQL，取得資料後修改 FakePreGods 內容
  // 計算後判斷是否符合規則
  const FakePreGods = [
    { uid: '3XWpTIWxwCQOHO4eOj3C8lu3ja03', league_id: 22000, this_period_win_bets: 29.5, this_period_win_rate: 0.65, first_week_win_handicap: 15, this_period_win_handicap: 54, this_league_win_handicap: 54 },
    { uid: 'BL0XzpN0tHNl6mr94Dmil6MEHpJ3', league_id: 22000, this_period_win_bets: 6, this_period_win_rate: 0.59, first_week_win_handicap: 46, this_period_win_handicap: 46, this_league_win_handicap: 58 },
    { uid: 'pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 5, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '1pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 3, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '2pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 4, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '3pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '4pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '5pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '6pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 192, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '7pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 193, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '8pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 193, this_period_win_handicap: 437, this_league_win_handicap: 681 },
    { uid: '9pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.61, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '10pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '11pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '12pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.72, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: '13pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: 22000, this_period_win_bets: 2, this_period_win_rate: 0.73, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
    { uid: 'vHuF5pYEpRSmdGYOjdCMf6LDsR52', league_id: 349, this_period_win_bets: 7.5, this_period_win_rate: 0.58, first_week_win_handicap: 20, this_period_win_handicap: 36, this_league_win_handicap: 36 }
  ];

  preGods = FakePreGods;
  // ---------- 以上 假大神合格資料 ----------

  //
  // 依聯盟 鑽石 依序處理
  //
  d('[鑽石大神] 開始處理');
  processGod(preGods, diamondList, godLeagueLimit, Limit, 'Diamond',
    ['-this_period_win_bets', '-first_week_win_handicap', '-this_period_win_handicap', '-this_league_win_handicap']);
  d('鑽石大神 diamondList: ', diamondList);
  d('[鑽石大神] 結束');

  //
  // 依聯盟 金銀銅 依序處理
  //
  d('[金銀銅大神] 開始處理');
  d('[金] 開始處理');
  processGod(preGods, goldList, godLeagueLimit, Limit, 'Gold',
    ['-this_period_win_rate', '-first_week_win_handicap', '-this_period_win_handicap', '-this_league_win_handicap']);
  d('金大神 goldList: ', goldList);

  d('[銀] 開始處理');
  processGod(preGods, sliverList, godLeagueLimit, Limit, 'Sliver',
    ['-this_period_win_rate', '-first_week_win_handicap', '-this_period_win_handicap', '-this_league_win_handicap']);
  d('銀大神 sliverList: ', sliverList);

  d('[銅] 開始處理');
  processGod(preGods, copperList, godLeagueLimit, Limit, 'Copper',
    ['-this_period_win_rate', '-first_week_win_handicap', '-this_period_win_handicap', '-this_league_win_handicap']);
  d('銅大神 copperList: ', copperList);

  d('[金銀銅大神] 結束');
  d('最終未錄選大神人員: ', preGods);

  if (!isEmulator) logger.log('[user settleGodRankModel]', allLogs);
}

// preGods: 需要處理的資料  num: 該rank取幾位  list: 儲存rank array
// godLeagueLimit: 大神-聯盟 錄取條件 該期第一星期盤數 和 該期總盤數
// rank: 鑽金銀銅大神  order: 排序條件
function processGod(preGods, list, godLeagueLimit, limit, rank, order) {
  const reformatPreGods = groupsByOrdersLimit(preGods, ['league_id'], order, 100);
  d(JSON.stringify(order));
  d('reformatPreGods Ori: ', reformatPreGods);

  reformatPreGods.forEach(function(godList) { // 這裡有順序性
    const limitObj = godLeagueLimit.find(o => o.league_id === godList.league_id); // 取得該聯盟的 limit
    d('God league limit: ', limitObj);
    d('God league godList.lists length: ', godList.lists.length);

    for (const [index, god] of Object.entries(godList.lists)) {
      // d('limit[rank]: ', (list.length < limit[rank].num), index, rank, limit[rank], god.this_period_win_bets, limit[rank].WinBetsLimit);
      if (list.length > limit[rank].num - 1) break; // 取得預定人數 就停止錄取
      if (rank === 'Diamond' && god.this_period_win_bets < limit[rank].WinBetsLimit) continue;
      if (rank === 'Gold' && god.this_period_win_rate < limit[rank].WinRateLimit) continue;
      if (rank === 'Sliver' && god.this_period_win_rate < limit[rank].WinRateLimit) continue;
      if (rank === 'Copper' && god.this_period_win_rate < limit[rank].WinRateLimit) continue;

      d('錄取 i : ', index, godList.league_id, god.uid);
      god.rank = rank;
      list.push(god);

      // 移除 preGods 符合 鑽石人員，避免 金銀銅 再次計算
      const removeIndex = preGods.findIndex(o => o.league_id === godList.league_id && o.uid === god.uid);
      preGods.splice(removeIndex, 1); // 移除已經加入顯示，如果第二次之後隨機取用，才不會重覆
    }
  });
}

// https://1loc.dev/
// const pluck = (objs, property) => objs.map(obj => obj[property]);

// function getMin(obj) {
//   const arr = Object.values(obj);
//   const min_first_week_win_handicap = Math.min(...pluck(arr, 'first_week_win_handicap'));
//   const min_this_period_win_handicap = Math.min(...pluck(arr, 'this_period_win_handicap'));
//   return {
//     first_week_win_handicap: min_first_week_win_handicap,
//     this_period_win_handicap: min_this_period_win_handicap
//   };
// }

module.exports = settleGodRank;
