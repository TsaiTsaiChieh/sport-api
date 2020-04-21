const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function godlists(args) {
  return new Promise(async function(resolve, reject) {
    const godLists = [];
    const period = modules.getTitlesPeriod(new Date()).period;
    const begin = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'));
    const end = modules.convertTimezone(modules.moment().utcOffset(8).format('YYYY-MM-DD'), 
      { op: 'add', value: 1, unit: 'days' }) - 1;

    try {
      // 取得 首頁預設值
      const defaultValues = await modules.firestore.collection('doSports_settings').doc('home_gods').get()
        .then(function(data){
          return data.data()
        });
      
      // 依 聯盟 取出是 大神資料 且 有販售
      // 將來有排序條件，可以orderBy，但會和下面的order衝突
      const godListsQuery = await db.sequelize.query(`
        select titles.uid, users.avatar, users.display_name,
               titles.rank_id, titles.default_title, titles.win_rate, titles.continue,
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
           and titles.period = :period
      `, { 
           replacements: {
             league: defaultValues['league'], 
             period: period,
             begin: begin,
             end: end
           }, 
           type: db.sequelize.QueryTypes.SELECT 
         }); 
      // 底下正式上線的時候要補到上面的sql，這段是用來處理大神是否有預測單 
              //      ,
              //  (
              //    select *
              //      from user__predictions
              //     where match_scheduled between :begin and :end
              //  ) prediction

              //  and titles.uid = prediction.uid

      if(godListsQuery.length <= 0) return resolve({ godlists: godLists }); // 如果沒有找到資料回傳 []

      godListsQuery.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
        return a.order > b.order; // 升 小->大
      });

      // 鑽 金 銀 銅 隨機選一個
      arrRandom(defaultValues['league'], godListsQuery, godLists); // 那一個聯盟需要隨機 資料來源陣例 回傳結果陣例
      
      await Promise.all(godLists);
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }

    return resolve({ godlists: godLists });
  });
}

function getRandom(x) {
  return Math.floor(Math.random()*x);
}

function arrRandom(league, sortedArr, lists) { // 從陣列取得隨機人員
  // 鑽 金 銀 銅 隨機選一個
  const diamondArr = [];
  const goldArr = [];
  const silverArr = [];
  const copperArr = [];

  sortedArr.forEach(async function (data) { // 把資料進行 鑽 金 銀 銅 分類
    switch (data[`rank_id`]){ // 大神等級分類
      case 1: diamondArr.push(data); break;
      case 2: goldArr.push(data); break;
      case 3: silverArr.push(data); break;
      case 4: copperArr.push(data); break;
      }
  });

  wants = 1; // 隨機取幾個

  for(let i=1; i<=wants; i++){
    [diamondArr, goldArr, silverArr, copperArr].forEach(function(arr){ // 鑽 金 銀 銅 依序產生
      if(arr.length > 0) {
        const index = getRandom(arr.length); // 取得隨機數
        lists.push(repackage(league, arr[index])); 
        arr.splice(index, 1); // 移除已經加入顯示，如果第二次之後隨機取用，才不會重覆
      }
    });
  }

}

function repackage(league, ele) { // 實際資料輸出格式
  let data = {
    league_win_lists: {},
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name
  };

  // 大神聯盟戰績表
  // 該聯盟有賣牌才能出現
  data.league_win_lists[league] = { // 聯盟 戰績表
    rank: `${ele.rank_id}`,
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
