const { getTitlesPeriod, leagueCodebook, coreDateInfo, fieldSorter, to } = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

async function godlists() {
  const godLists = [];
  const period = getTitlesPeriod(new Date()).period;
  const nowInfo = coreDateInfo(new Date());
  const beginUnix = nowInfo.dateBeginUnix;
  const endUnix = nowInfo.dateEndUnix;

  // 取得 首頁預設值
  const listLeague = await db.Home_List.findOne({ where: { id: 1 } });
  const defaultLeague = listLeague.god_list;
  const league_id = leagueCodebook(defaultLeague).id;

  // 依 聯盟 取出是 大神資料 且 有販售
  // 將來有排序條件，可以orderBy，但會和下面的order衝突
  const [err, godListsQuery] = await to(db.sequelize.query(`
        select titles.uid, users.avatar, users.display_name,
               titles.rank_id, titles.default_title, titles.win_rate, titles.continue,
               titles.predict_rate1, titles.predict_rate2, titles.predict_rate3, titles.win_bets_continue,
               titles.matches_rate1, titles.matches_rate2, titles.matches_continue
          from titles,
               (
                 select * 
                   from users
                  where status = 2
               ) users
         where titles.uid = users.uid
           and titles.league_id = :league_id
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
    console.error('Error in  home/godlists by YuHsien:  %o', err);
    throw errs.dbErrsMsg('404', '14020');
  }
  // 底下正式上線的時候要補到上面的sql，這段是用來處理大神是否有預測單
  //      ,
  //  (
  //    select *
  //      from user__predictions
  //     where match_scheduled between :begin and :end
  //  ) prediction

  //  and titles.uid = prediction.uid

  if (godListsQuery === undefined || godListsQuery.length <= 0) return { godlists: godLists }; // 如果沒有找到資料回傳 []

  godListsQuery.sort(fieldSorter(['order']));// 進行 order 排序，將來後台可能指定順序

  // 鑽 金 銀 銅 隨機選一個
  arrRandom(defaultLeague, godListsQuery, godLists); // 那一個聯盟需要隨機 資料來源陣例 回傳結果陣例

  return { godlists: godLists };
}

function getRandom(x) {
  return Math.floor(Math.random() * x);
}

function arrRandom(league, sortedArr, lists) { // 從陣列取得隨機人員
  // 鑽 金 銀 銅 隨機選一個
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

  const wants = 1; // 隨機取幾個

  for (let i = 1; i <= wants; i++) {
    [diamondArr, goldArr, silverArr, copperArr].forEach(function(arr) { // 鑽 金 銀 銅 依序產生
      if (arr.length > 0) {
        const index = getRandom(arr.length); // 取得隨機數
        lists.push(repackage(league, arr[index]));
        arr.splice(index, 1); // 移除已經加入顯示，如果第二次之後隨機取用，才不會重覆
      }
    });
  }
}

function repackage(league, ele) { // 實際資料輸出格式
  const data = {
    league_win_lists: {},
    uid: ele.uid,
    avatar: ele.avatar,
    display_name: ele.display_name
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
