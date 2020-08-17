const { getTitlesPeriod, groupsByOrdersLimit } = require('../../util/modules');
const db = require('../../util/dbUtil');
const { logger } = require('../../util/loggerUtil');

let allLogs = [];
let logT = {};
let logNum = -1;
const isEmulator = process.env.FUNCTIONS_EMULATOR || process.env.NODE_ENV !== 'production';

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

  // period 例：目前時間在 12 期區間，需要計算符合大神為 11 期區間 (上一期)
  // getTitlesPeriod(now) 依上面說明為取得 11 期
  // nowPeriod = 12 本期
  // lastPeriod = 11 上一期
  // users__win__lists__histories 新增資料的 period 是用 nowPeriod，大神產生計算要使用 lastPeriod
  // users__win__lists 新增和更新資料 是用 nowPeriod
  // 大神產生實際是依照上期的資料，來產生上一期大神
  // 本期資料是在累計算，直到下一期開始的第一天時，該天 本期資料會變成上一期資料，取得本期已經是下一期
  const now = new Date();
  const lastPeriod = getTitlesPeriod(now).period; // 上一期期數
  const lastPeriod_date = getTitlesPeriod(now).date; // 上一期開始日期
  const last2Period = lastPeriod - 1; // 上上期期數
  const nowPeriod = lastPeriod + 1;
  const diamondList = {};
  const goldList = {};
  const sliverList = {};
  const copperList = {};
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

  const godLeagueLimit = await db.sequelize.query(`
    select league_id, first_week_win_handicap, this_period_win_handicap
      from god_limits
     where period = :period
  `, {
    replacements: {
      period: lastPeriod
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  // const limitMin = getMin(godLeagueLimit);
  // d('limitMin: ===========', limitMin);

  // 依照各聯盟大神 該期第一星期盤數 和 該期盤數 且 限制產生對應的 SQL條件
  // ( league_id = '11235' and first_week_win_handicap >= 10 and this_period_win_handicap >= 30 ) OR
  const limitArr = [];
  godLeagueLimit.forEach(function(data) {
    limitArr.push(` ( league_id = '${data.league_id}' and first_week_win_handicap >= ${data.first_week_win_handicap} and this_period_win_handicap >= ${data.this_period_win_handicap} ) `);
  });
  const limitSQL = limitArr.join(' OR ');

  // this_period_win_bets 和 this_period_win_rate 改成使用 users__win__lists__histories，不再讀 users__win__lists
  // 避免無法重算，因為 users__win__lists 的 this_period_win_bets、this_period_win_rate 會被移到 last_period_win_bets、
  // last_period_win_rate，然後被清空掉，這樣就無法重算
  const preGods = await db.sequelize.query(`
    select *
      from (
              select uid, league_id,
                     sum(win_bets) this_period_win_bets,
                     round(sum(correct_counts) / sum(correct_counts + fault_counts), 4) this_period_win_rate,
                     (
                        select sum(correct_counts + fault_counts)
                          from users__win__lists__histories
                         where uid = uwlh.uid
                           and league_id = uwlh.league_id
                           and period  = uwlh.period
                           and week_of_period = 1
                     ) first_week_win_handicap,
                     sum(correct_counts + fault_counts) this_period_win_handicap,
                     (
                        select sum(correct_counts + fault_counts)
                          from users__win__lists__histories
                         where uid = uwlh.uid
                           and league_id = uwlh.league_id
                     ) this_league_win_handicap 
                from users__win__lists__histories uwlh
               where period = :period
               group by uid, league_id, period
              having ( this_period_win_bets >= :diamondWinBetsLimit or this_period_win_rate >= :gscWinRateLimit )
           ) pregod
     where ( ${limitSQL} )
    -- order by league_id, first_week_win_handicap, this_period_win_handicap, this_league_win_handicap
  `, {
    replacements: {
      period: lastPeriod,
      diamondWinBetsLimit: Limit.Diamond.WinBetsLimit,
      gscWinRateLimit: Limit.Copper.WinRateLimit
    },
    type: db.sequelize.QueryTypes.SELECT
  });

  // // 使用假大神合格資料進行開發測試，假大神資料可以先在 正式 DB 執行上面的 SQL，取得資料後修改 FakePreGods 內容
  // // 計算後判斷是否符合規則
  // const FakePreGods = [
  //   { uid: '3XWpTIWxwCQOHO4eOj3C8lu3ja03', league_id: '22000', this_period_win_bets: 29.5, this_period_win_rate: 0.65, first_week_win_handicap: 15, this_period_win_handicap: 54, this_league_win_handicap: 54 },
  //   { uid: 'BL0XzpN0tHNl6mr94Dmil6MEHpJ3', league_id: '22000', this_period_win_bets: 6, this_period_win_rate: 0.59, first_week_win_handicap: 46, this_period_win_handicap: 46, this_league_win_handicap: 58 },
  //   { uid: 'pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 5, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '1pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 3, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '2pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 4, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '3pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '4pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '5pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '6pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 193, this_period_win_handicap: 436, this_league_win_handicap: 680 },
  //   { uid: '7pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 193, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '8pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.62, first_week_win_handicap: 193, this_period_win_handicap: 437, this_league_win_handicap: 681 },
  //   { uid: '9pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.61, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '10pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '11pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.52, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '12pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.72, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: '13pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 2, this_period_win_rate: 0.73, first_week_win_handicap: 191, this_period_win_handicap: 436, this_league_win_handicap: 681 },
  //   { uid: 'vHuF5pYEpRSmdGYOjdCMf6LDsR52', league_id: '349', this_period_win_bets: 7.5, this_period_win_rate: 0.58, first_week_win_handicap: 20, this_period_win_handicap: 36, this_league_win_handicap: 36 },
  //   { uid: 'pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '3939', this_period_win_bets: 50, this_period_win_rate: 0.6753, first_week_win_handicap: 56, this_period_win_handicap: 154, this_league_win_handicap: 319 }
  // ];

  // 12期
  // const FakePreGods = [
  //   { uid: 'lQ8saEZ8X6RAbyMw47PvnnijxPn1', league_id: '3939', this_period_win_bets: 19.5, this_period_win_rate: 0.5868, first_week_win_handicap: 40, this_period_win_handicap: 121, this_league_win_handicap: 138 },
  //   { uid: 'mkIKkSsfbIVj7vP5ScGtwxI7Och1', league_id: '349', this_period_win_bets: 7.5, this_period_win_rate: 0.5000, first_week_win_handicap: 16, this_period_win_handicap: 52, this_league_win_handicap: 52 },
  //   { uid: 'mkIKkSsfbIVj7vP5ScGtwxI7Och1', league_id: '3939', this_period_win_bets: 10.5, this_period_win_rate: 0.6471, first_week_win_handicap: 11, this_period_win_handicap: 34, this_league_win_handicap: 34 },
  //   { uid: 'oAX4PJGdbYRdPtchSrhEjQzBrXY2', league_id: '2274', this_period_win_bets: 8, this_period_win_rate: 0.6111, first_week_win_handicap: 16, this_period_win_handicap: 36, this_league_win_handicap: 36 },
  //   { uid: 'oAX4PJGdbYRdPtchSrhEjQzBrXY2', league_id: '347', this_period_win_bets: 12.5, this_period_win_rate: 0.6275, first_week_win_handicap: 23, this_period_win_handicap: 51, this_league_win_handicap: 51 },
  //   { uid: 'oAX4PJGdbYRdPtchSrhEjQzBrXY2', league_id: '3939', this_period_win_bets: 8, this_period_win_rate: 0.5385, first_week_win_handicap: 57, this_period_win_handicap: 117, this_league_win_handicap: 142 },
  //   { uid: 'pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '22000', this_period_win_bets: 11.5, this_period_win_rate: 0.5228, first_week_win_handicap: 256, this_period_win_handicap: 681, this_league_win_handicap: 1225 },
  //   { uid: 'pjFuLyI9Q9Wu4VZ4ZPUFXdvNpGn1', league_id: '3939', this_period_win_bets: 12, this_period_win_rate: 0.5224, first_week_win_handicap: 127, this_period_win_handicap: 268, this_league_win_handicap: 449 },
  //   { uid: 's5gNFdKiVscxqm3P0BINoV4SxCd2', league_id: '349', this_period_win_bets: 8.5, this_period_win_rate: 0.5690, first_week_win_handicap: 21, this_period_win_handicap: 58, this_league_win_handicap: 58 },
  //   { uid: 'Ucdf3ee92a0ea38b034a00dc10506521e', league_id: '3939', this_period_win_bets: 7.5, this_period_win_rate: 0.5325, first_week_win_handicap: 13, this_period_win_handicap: 77, this_league_win_handicap: 88 },
  //   { uid: 'vHuF5pYEpRSmdGYOjdCMf6LDsR52', league_id: '3939', this_period_win_bets: 8, this_period_win_rate: 0.5556, first_week_win_handicap: 44, this_period_win_handicap: 72, this_league_win_handicap: 125 }
  // ];
  // preGods = FakePreGods;
  // // ---------- 以上 假大神合格資料 ----------

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

  // 新增 大神歷史戰績 並 更新 本月 win_bet、win_rate
  d('新增 大神歷史戰績 開始');
  await createTitlesGod(diamondList, goldList, sliverList, copperList, lastPeriod, lastPeriod_date);
  d('新增 大神歷史戰績 結束');

  // 重置 Users status 上期大神 2 改為 一般玩家 1
  d('重置上一期大神 使用者狀態 還原為 一般玩家 開始');
  await resetGod2Player(last2Period);
  d('重置上一期大神 使用者狀態 還原為 一般玩家 結束');

  // 更新 這期大神 使用者狀態 及 累計大神計數 及 預設大神成就顯示聯盟
  d('更新 這期大神 使用者狀態 及 累計大神計數 及 預設大神成就顯示聯盟 開始');
  await updateGodInfo(lastPeriod);
  d('更新 這期大神 使用者狀態 及 累計大神計數 及 預設大神成就顯示聯盟 結束');

  // 本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數 移到上期，本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數
  d('更新 本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數 移到上期，本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數 開始');
  await updateWins();
  d('更新 本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數 移到上期，本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數 結束');

  // 大神計算合格條件 複制上一期條件到本期
  d('新增 大神計算合格條件 複制上一期條件到本期 開始');
  await insertGodLimit(lastPeriod, nowPeriod);
  d('新增 大神計算合格條件 複制上一期條件到本期 結束');

  if (!isEmulator) logger.info('[user settleGodRankModel] ...', allLogs);
  return { status: 'ok' };
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
      if (list[godList.league_id] && list[godList.league_id].length > limit[rank].num - 1) break; // 取得預定人數 就停止錄取
      if (rank === 'Diamond' && god.this_period_win_bets < limit[rank].WinBetsLimit) continue;
      if (rank === 'Gold' && god.this_period_win_rate < limit[rank].WinRateLimit) continue;
      if (rank === 'Sliver' && god.this_period_win_rate < limit[rank].WinRateLimit) continue;
      if (rank === 'Copper' && god.this_period_win_rate < limit[rank].WinRateLimit) continue;

      d('錄取 i : ', index, godList.league_id, god.uid);
      god.rank = rank;
      if (!list[godList.league_id]) list[godList.league_id] = []; // 第一次該聯盟產生大神，初始化 []
      list[godList.league_id].push(god);

      // 移除 preGods 錄取人員，避免重覆錄取
      const removeIndex = preGods.findIndex(o => o.league_id === godList.league_id && o.uid === god.uid);
      preGods.splice(removeIndex, 1); // 移除已經加入顯示，如果第二次之後隨機取用，才不會重覆
    }
  });
}

// 新增 大神歷史戰績 並 更新 本月 win_bet、win_rate
async function createTitlesGod(diamondList, goldList, sliverList, copperList, period, period_date) {
  for (const datas of Object.values(diamondList)) {
    for (const data of Object.values(datas)) {
      await db.Title.create({
        uid: data.uid,
        league_id: data.league_id,
        period: period,
        period_date: period_date,
        rank_id: 1
      });
    }
  };

  for (const datas of Object.values(goldList)) {
    for (const data of Object.values(datas)) {
      await db.Title.create({
        uid: data.uid,
        league_id: data.league_id,
        period: period,
        period_date: period_date,
        rank_id: 2
      });
    }
  };

  for (const datas of Object.values(sliverList)) {
    for (const data of Object.values(datas)) {
      await db.Title.create({
        uid: data.uid,
        league_id: data.league_id,
        period: period,
        period_date: period_date,
        rank_id: 3
      });
    }
  };

  for (const datas of Object.values(copperList)) {
    for (const data of Object.values(datas)) {
      await db.Title.create({
        uid: data.uid,
        league_id: data.league_id,
        period: period,
        period_date: period_date,
        rank_id: 4
      });
    }
  };

  // 統一更新 這期大神 本月 win_bet、win_rate
  await db.sequelize.query(`
    update titles,
           ( select uid, league_id, this_month_win_rate, this_month_win_bets from users__win__lists ) src
       set titles.win_bets = src.this_month_win_bets,
           titles.win_rate = src.this_month_win_rate
     where titles.uid = src.uid
       and titles.league_id = src.league_id
       and titles.period = :period
  `, {
    replacements: {
      period: period
    },
    type: db.sequelize.QueryTypes.UPDATE
  });
}

// 重置 Users status 上期大神 2 改為 一般玩家 1
async function resetGod2Player(period) {
  // 將上期大神 重置為 一般使用者 和 預設聯盟為 NULL  // 不使用這方式：原本為直接把所有人都改1 排除管理者(status=9)
  await db.sequelize.query(`
      UPDATE users, ( select distinct uid from titles where period = :period ) titles 
         SET status = 1, default_god_league_rank = NULL 
       WHERE users.uid = titles.uid
  `, {
    replacements: {
      period: period
    },
    type: db.sequelize.QueryTypes.UPDATE
  });
}

// 更新 這期大神 使用者狀態 及 累計大神計數
async function updateGodInfo(period) {
  // const merageList = [...new Set([...diamondList, ...goldList, ...sliverList, ...copperList])];
  // d('merageList: ', merageList);

  // 更新所有人的大神榮譽戰績 SQL
  //   update users,
  //        (
  //          select uid,
  //                 (select count(uid) from titles where uid = users.uid and rank_id = 1) rank1,
  //                 (select count(uid) from titles where uid = users.uid and rank_id = 2) rank2,
  //                 (select count(uid) from titles where uid = users.uid and rank_id = 3) rank3,
  //                 (select count(uid) from titles where uid = users.uid and rank_id = 4) rank4
  //            from users
  //        ) ranks
  //    set users.rank1_count = ranks.rank1,
  //        users.rank2_count = ranks.rank2,
  //        users.rank3_count = ranks.rank3,
  //        users.rank4_count = ranks.rank4
  //  where users.uid = ranks.uid
  // ;

  // 更新 有在 titles 當過大神的才會更新 使用者狀態 及 累計大神計數 及 預設大神成就顯示聯盟
  await db.sequelize.query(`
    update users,
           (
              select distinct titles.uid, league_id,
                     (select count(uid) from titles where uid = users.uid and rank_id = 1) rank1,
                     (select count(uid) from titles where uid = users.uid and rank_id = 2) rank2,
                     (select count(uid) from titles where uid = users.uid and rank_id = 3) rank3,
                     (select count(uid) from titles where uid = users.uid and rank_id = 4) rank4
                from users, titles
               where users.uid = titles.uid
                 and titles.period = :period
           ) ranks
       set users.status = 2,
           users.default_god_league_rank = ranks.league_id, 
           users.rank1_count = ranks.rank1,
           users.rank2_count = ranks.rank2,
           users.rank3_count = ranks.rank3,
           users.rank4_count = ranks.rank4
     where users.uid = ranks.uid
  `, {
    replacements: {
      period: period
    },
    type: db.sequelize.QueryTypes.UPDATE
  });
}

// 本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數 移到上期，本期|本期第一周 勝率/勝注/正確盤數/錯誤盤數
async function updateWins() {
  // 底下 SQL 為出錯後，還原"本期"資料的方式  期數要設正確
  // 實際上更新資料眾多，底下只是 本期 的範例
  // update users__win__lists, (
  //        select uid, league_id,
  //               sum(win_bets) this_period_win_bets,
  //               round(sum(correct_counts) / sum(correct_counts + fault_counts), 2) this_period_win_rate
  //          from users__win__lists__histories uwlh
  //         where period = 11
  //         group by uid, league_id, period
  //        ) src
  //    set this_period_win_bets = src.this_period_win_bets,
  //        this_period_win_rate = src.this_period_win_rate
  //        -- last_period_win_bets = src.this_period_win_bets,
  //        -- last_period_win_rate = src.this_period_win_rate
  //  where uid = src.uid
  //    and league_id = src.league_id;

  await db.sequelize.query(`
    update users__win__lists
       set last_period_win_bets = this_period_win_bets,
           last_period_win_rate = this_period_win_rate,
           last_period_correct_counts = this_period_correct_counts,
           last_period_fault_counts = this_period_fault_counts,
           last_week1_of_period_win_bets = this_week1_of_period_win_bets,
           last_week1_of_period_win_rate = this_week1_of_period_win_rate,
           last_week1_of_period_correct_counts = this_week1_of_period_correct_counts,
           last_week1_of_period_fault_counts = this_week1_of_period_fault_counts,
           this_period_win_bets = NULL,
           this_period_win_rate = NULL,
           this_period_correct_counts = NULL,
           this_period_fault_counts = NULL,
           this_week1_of_period_win_bets = NULL,
           this_week1_of_period_win_rate = NULL,
           this_week1_of_period_correct_counts = NULL,
           this_week1_of_period_fault_counts = NULL
  `, {
    type: db.sequelize.QueryTypes.UPDATE
  });
}

// 新增 大神計算合格條件 複制上一期條件到本期
async function insertGodLimit(lastPeriod, nowPeriod) {
  await db.sequelize.query(`
    insert into god_limits (league_id, period, first_week_win_handicap, this_period_win_handicap, createdAt, updatedAt)
      select league_id, :nowPeriod, first_week_win_handicap, this_period_win_handicap, now(), now()
        from god_limits
       where period = :lastPeriod
  `, {
    replacements: {
      lastPeriod: lastPeriod,
      nowPeriod: nowPeriod
    },
    logging: true,
    type: db.sequelize.QueryTypes.INSERT
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
