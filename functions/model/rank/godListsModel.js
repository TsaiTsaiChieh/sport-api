const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function godlists(args) {
  return new Promise(async function(resolve, reject) {
    const godLists = {};

    // 取得當期期數
    const period = modules.getTitlesPeriod(new Date()).period;
    const league = args.league;

    try {
      // 依 聯盟 取出是 大神資料 且 有販售
      // 將來有排序條件，可以orderBy，但會和下面的order衝突
      const godListsQuery = await db.sequelize.query(`
        select titles.uid, users.avatar, users.display_name, titles.rank_id, titles.default_title,
               titles.win_bets, titles.win_rate,
               titles.continune, 
               titles.predict_rate1, titles.predict_rate2, titles.predict_rate3, titles.win_bets_continue,
               titles.matches_rate1, titles.matches_rate2, titles.matches_continue
          from titles,
               ( 
                 select league_id 
                   from match__leagues
                  where name = :league 
               ) leagues,
               (
                 select * 
                   from users
                  where status = 2
               ) users
         where titles.league_id = leagues.league_id
           and titles.uid = users.uid
           and titles.period = ${period}
      `, { replacements:{league: league}, type: db.sequelize.QueryTypes.SELECT }); // 還少 販售條件 等待 預頁單 table

      if(godListsQuery.length <= 0) return { godlists: godLists }; // 如果沒有找到資料回傳 []

      godListsQuery.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
        return a.order > b.order; // 升 小->大
      });

      // 鑽 金 銀 銅 分類
      rankGroup(godListsQuery, godLists);
    } catch (err) {
      console.log('Error in  rank/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }

    resolve({ godlists: godLists });
    return;
  });
}

function rankGroup(sortedArr, godLists) { // 從陣列取得隨機人員
  const diamondArr = [];
  const godArr = [];
  const silverArr = [];
  const copperArr = [];

  sortedArr.forEach(async function (data) { // 把資料進行 鑽 金 銀 銅 分類
    switch (data[`rank_id`]){ // 大神等級分類
      case 1: diamondArr.push(data); break;
      case 2: godArr.push(data); break;
      case 3: silverArr.push(data); break;
      case 4: copperArr.push(data); break;
    }
  });

  // 鑽石 依勝注 排序
  diamondArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_bets < b.win_bets; // 降 大->小
  });
  godLists['diamond'] = diamondArr.map(function(t){
    return repackage_winBets(t); 
  });

  // 金 依勝率 排序
  godArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists['god'] = godArr.map(function(t){
    return repackage_winRate(t); 
  });

  // 銀 依勝率 排序
  silverArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists['silver'] = silverArr.map(function(t){
    return repackage_winRate(t); 
  });

  // 銅 依勝率 排序
  copperArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists['copper'] = copperArr.map(function(t){
    return repackage_winRate(t); 
  });
}

function repackage_winBets(ele) { // 實際資料輸出格式
  let data = {
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name,
    rank: ele.rank_id,
    default_title: ele.default_title,
    win_bets: ele.win_bets,
    sell: ele.sell,
    continune: ele.continue, // 連贏Ｎ場
    predict_rate: [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3], // 近N日 N過 N
    predict_rate2: [ele.predict_rate1, ele.predict_rate3], // 近N日過 N
    win_bets_continue: ele.win_bets_continue, // 勝注連過 Ｎ日
    matches_rate: [ele.matches_rate1, ele.matches_rate2], // 近 Ｎ 場過 Ｎ 場
    matches_continue: ele.matches_continue // 連贏Ｎ場
  };

  return data;
}

function repackage_winRate(ele) { // 實際資料輸出格式
  let data = {
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name,
    rank: ele.rank,
    default_title: ele.default_title,
    win_rate: ele.win_rate,
    sell: ele.sell,
    continune: ele.continue, // 連贏Ｎ場
    predict_rate: [ele.predict_rate1, ele.predict_rate2, ele.predict_rate3], // 近N日 N過 N
    predict_rate2: [ele.predict_rate1, ele.predict_rate3], // 近N日過 N
    win_bets_continue: ele.win_bets_continue, // 勝注連過 Ｎ日
    matches_rate: [ele.matches_rate1, ele.matches_rate2], // 近 Ｎ 場過 Ｎ 場
    matches_continue: ele.matches_continue // 連贏Ｎ場
  };

  return data;
}

module.exports = godlists;
