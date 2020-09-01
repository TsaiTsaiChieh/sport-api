const { getTitlesPeriod, coreDateInfo, fieldSorter, to } = require('../../util/modules');
const { leagueCodebook } = require('../../util/leagueUtil');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const { acceptLeague } = require('../../config/acceptValues');
// const { CacheQuery } = require('../../util/redisUtil');

async function godlists(args) {
  const godLists = {};

  // 取得當期期數
  const period = getTitlesPeriod(new Date()).period;
  const league = args.league;
  const nowInfo = coreDateInfo(new Date());
  const beginUnix = nowInfo.dateBeginUnix;
  const endUnix = nowInfo.dateEndUnix;

  const league_id = [];
  if (league === 'ALL') {
    const len = acceptLeague.length;
    for (let i = 0; i < len; i++) {
      league_id.push(leagueCodebook(acceptLeague[i]).id);
    }
  } else {
    league_id.push(leagueCodebook(league).id);
  }

  // 當賣牌時，快取會無法跟上更新
  // const redisKey = ['rank', 'godLists', 'titles', league_id, period, beginUnix, endUnix].join(':');

  // 依 聯盟 取出是 大神資料 和 大神賣牌狀態 sell (-1：無狀態  0：免費  1：賣牌)
  const [err, godListsQuery] = await to(db.sequelize.query(`
      select titles.uid, titles.league_id, users.avatar, users.display_name, titles.rank_id, winlist.last_period_win_bets as win_bets, winlist.last_period_win_rate as win_rate,
             CASE prediction.sell
               WHEN 1 THEN 1
               WHEN 0 THEN 0
               ELSE -1
             END sell,
             titles.default_title,
             titles.continue, 
             titles.predict_rate1, titles.predict_rate2, titles.predict_rate3, titles.win_bets_continue,
             titles.matches_rate1, titles.matches_rate2, titles.matches_continue
        from titles
       inner join
             (
               select * 
                 from users
                where status = 2
             ) users
          on titles.uid = users.uid
        left join 
             (
               select uid, max(sell) sell
                 from user__predictions
                where match_scheduled between :begin and :end
                group by uid
             ) prediction
          on titles.uid = prediction.uid
         left join 
            (
                select uid, league_id, last_period_win_bets, last_period_win_rate from users__win__lists 
            ) winlist
          on winlist.uid = titles.uid and winlist.league_id = titles.league_id
       where titles.league_id in ( :league_id )
         and titles.period = :period
    `, {
    replacements: {
      league_id: league_id,
      period: period,
      begin: beginUnix,
      end: endUnix
    },
    type: db.sequelize.QueryTypes.SELECT
  }));
  if (err) {
    console.error('[Error][rank][godListsModel][godListsQuery] ', err);
    throw errs.dbErrsMsg('404', '13810');
  }

  if (!godListsQuery || godListsQuery.length <= 0) return { godlists: godLists }; // 如果沒有找到資料回傳 []

  // 進行 order 排序，將來後台可能指定順序  這個部份可能無法正常運作，因為 order 不知道放那
  godListsQuery.sort(fieldSorter(['order'])); // 升 小->大

  // 鑽 金 銀 銅 分類
  rankGroup(godListsQuery, godLists);

  return { period: period, godlists: godLists };
}

function rankGroup(sortedArr, godLists) { // 從陣列取得隨機人員
  const diamondArr = [];
  const goldArr = [];
  const silverArr = [];
  const copperArr = [];

  sortedArr.forEach(async function(data) { // 把資料進行 鑽 金 銀 銅 分類
    switch (data.rank_id) { // 大神等級分類
      case 1: diamondArr.push(data); break;
      case 2: goldArr.push(data); break;
      case 3: silverArr.push(data); break;
      case 4: copperArr.push(data); break;
    }
  });

  // 底下順序將來會有可能別的條件，可以在 sort 內進行判斷
  // 進行 order 排序，將來後台可能指定順序
  // 鑽石 依勝注 排序
  diamondArr.sort(fieldSorter(['-win_bets'])); // 降 大->小
  godLists.diamond = diamondArr.map(function(t) {
    return repackage_winBets(t);
  });

  // 金 依勝率 排序
  goldArr.sort(fieldSorter(['-win_rate'])); // 降 大->小
  godLists.gold = goldArr.map(function(t) {
    return repackage_winRate(t);
  });

  // 銀 依勝率 排序
  silverArr.sort(fieldSorter(['-win_rate'])); // 降 大->小
  godLists.silver = silverArr.map(function(t) {
    return repackage_winRate(t);
  });

  // 銅 依勝率 排序
  copperArr.sort(fieldSorter(['-win_rate'])); // 降 大->小
  godLists.copper = copperArr.map(function(t) {
    return repackage_winRate(t);
  });
}

function repackage_winBets(ele) { // 實際資料輸出格式
  const data = {
    uid: ele.uid,
    league_id: ele.league_id,
    avatar: ele.avatar,
    display_name: ele.display_name,
    rank: `${ele.rank_id}`,
    sell: ele.sell,
    default_title: ele.default_title,
    win_bets: ele.win_bets,
    continue: ele.continue, // 連贏Ｎ場
    predict_rate: [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3], // 近N日 N過 N
    predict_rate2: [ele.predict_rate1, ele.predict_rate3], // 近N日過 N
    win_bets_continue: ele.win_bets_continue, // 勝注連過 Ｎ日
    matches_rate: [ele.matches_rate1, ele.matches_rate2], // 近 Ｎ 場過 Ｎ 場
    matches_continue: ele.matches_continue // 連贏Ｎ場
  };

  return data;
}

function repackage_winRate(ele) { // 實際資料輸出格式
  const data = {
    uid: ele.uid,
    league_id: ele.league_id,
    avatar: ele.avatar,
    display_name: ele.display_name,
    rank: `${ele.rank_id}`,
    sell: ele.sell,
    default_title: ele.default_title,
    win_rate: ele.win_rate,
    continue: ele.continue, // 連贏Ｎ場
    predict_rate: [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3], // 近N日 N過 N
    predict_rate2: [ele.predict_rate1, ele.predict_rate3], // 近N日過 N
    win_bets_continue: ele.win_bets_continue, // 勝注連過 Ｎ日
    matches_rate: [ele.matches_rate1, ele.matches_rate2], // 近 Ｎ 場過 Ｎ 場
    matches_continue: ele.matches_continue // 連贏Ｎ場
  };

  return data;
}

module.exports = godlists;
