const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function godlists(args) {
  return new Promise(async function(resolve, reject) {
    const godLists = {};

    // 取得當期期數
    const period = modules.getTitlesPeriod(new Date()).period;
    const league = args.league;
    const league_id = modules.leagueCodebook(league).id;
    const begin = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'));
    const end = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'),
      { op: 'add', value: 1, unit: 'days' }) - 1;
    
    try {
      // 依 聯盟 取出是 大神資料 和 大神賣牌狀態 sell (-1：無狀態  0：免費  1：賣牌)
      const godListsQuery = await db.sequelize.query(`
        select titles.uid, users.avatar, users.display_name, titles.rank_id, 
               CASE prediction.sell
                 WHEN 1 THEN 1
                 WHEN 0 THEN 0
                 ELSE -1
               END sell,
               titles.default_title,
               titles.win_bets, titles.win_rate,
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
         where titles.league_id = :league_id
           and titles.period = :period
      `, {
        replacements: {
          league_id: league_id,
          period: period,
          begin: begin,
          end: end
        },
        type: db.sequelize.QueryTypes.SELECT
      });

      if (godListsQuery.length <= 0) return resolve({ godlists: godLists }); // 如果沒有找到資料回傳 []

      // 進行 order 排序，將來後台可能指定順序  這個部份可能無法正常運作，因為 order 不知道放那
      godListsQuery.sort(function compare(a, b) {
        return a.order > b.order; // 升 小->大
      });

      // 鑽 金 銀 銅 分類
      rankGroup(godListsQuery, godLists);
    } catch (err) {
      console.log('Error in  rank/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }

    return resolve({ period: period, godlists: godLists });
  });
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
  // 鑽石 依勝注 排序
  diamondArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_bets < b.win_bets; // 降 大->小
  });
  godLists.diamond = diamondArr.map(function(t) {
    return repackage_winBets(t);
  });

  // 金 依勝率 排序
  goldArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists.gold = goldArr.map(function(t) {
    return repackage_winRate(t);
  });

  // 銀 依勝率 排序
  silverArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists.silver = silverArr.map(function(t) {
    return repackage_winRate(t);
  });

  // 銅 依勝率 排序
  copperArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists.copper = copperArr.map(function(t) {
    return repackage_winRate(t);
  });
}

function repackage_winBets(ele) { // 實際資料輸出格式
  const data = {
    uid: ele.uid,
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
    avatar: ele.avatar,
    displayname: ele.display_name,
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
