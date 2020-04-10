const modules = require('../../util/modules');
const errs = require('../../util/errorCode');

function godlists(args) {
  return new Promise(async function(resolve, reject) {
    const godLists = {};

    // 取得當期期數
    const periods = modules.getTitlesPeriod(new Date());
    const league = args.league;

    try {
      // god_recommend_聯盟 取出是 大神資料 且 有販售
      // 將來有排序條件，可以orderBy，但會和下面的order衝突
      const godListsQuery = await modules.firestore.collection(`god_recommend_${league}`)
        .where('period', '==', periods.period)
        .get();

      const sortedArr = godListsQuery.docs.map(function (doc) {  // 轉換成array
        return doc.data()
      });

      // sortedArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
      //   return a.order > b.order; // 升 小->大
      // });

      // 鑽 金 銀 銅 分類
      rankGroup(sortedArr, godLists);

      // await Promise.all(godLists);
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
    switch (data[`rank`]){ // 大神等級分類
      case '1': diamondArr.push(data); break;
      case '2': godArr.push(data); break;
      case '3': silverArr.push(data); break;
      case '4': copperArr.push(data); break;
    }
  });

  // 鑽石 依勝注 排序
  diamondArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_bets < b.win_bets; // 降 大->小
  });
  godLists['1'] = diamondArr.map(function(t){
    return repackage_winBets(t); 
  });

  // 金 依勝率 排序
  godArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists['2'] = godArr.map(function(t){
    return repackage_winRate(t); 
  });

  // 銀 依勝率 排序
  silverArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists['3'] = silverArr.map(function(t){
    return repackage_winRate(t); 
  });

  // 銅 依勝率 排序
  copperArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
    return a.win_rate < b.win_rate; // 降 大->小
  });
  godLists['4'] = copperArr.map(function(t){
    return repackage_winRate(t); 
  });
}

function repackage_winBets(ele) { // 實際資料輸出格式
  let data = {
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.displayname,
    rank: ele.rank,
    win_bets: ele.win_bets,
    sell: ele.sell,
    continune: ele.continue, // 連贏Ｎ場
    predict_rate: ele.predict_rate, // 近N日 N過 N
    predict_rate2: ele.predict_rate2, // 近N日過 N
    win_bets_continue: ele.win_bets_continue, // 勝注連過 Ｎ日
    matches_rate: ele.matches_rate, // 近 Ｎ 場過 Ｎ 場
    matches_continue: ele.matches_continue // 連贏Ｎ場
  };

  return data;
}

function repackage_winRate(ele) { // 實際資料輸出格式
  let data = {
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.displayname,
    rank: ele.rank,
    win_rate: ele.win_rate,
    sell: ele.sell,
    continune: ele.continue, // 連贏Ｎ場
    predict_rate: ele.predict_rate, // 近N日 N過 N
    predict_rate2: ele.predict_rate2, // 近N日過 N
    win_bets_continue: ele.win_bets_continue, // 勝注連過 Ｎ日
    matches_rate: ele.matches_rate, // 近 Ｎ 場過 Ｎ 場
    matches_continue: ele.matches_continue // 連贏Ｎ場
  };

  return data;
}

module.exports = godlists;
