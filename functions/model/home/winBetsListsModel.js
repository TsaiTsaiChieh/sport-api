const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function winBetsLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    let league_id = 'league_id';
    const defaultValues = await db.sequelize.query(
      `SELECT * FROM match__leagues ORDER BY ${league_id} DESC LIMIT 1`,
      {
        type: db.sequelize.QueryTypes.SELECT,
      }).then(function(data){
        return data[0];
      });
   
    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }
    let winBetsLists = {};
    winBetsLists[defaultValues.name] = []; // 像上面的範例
    
    try {
      for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
        const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料
        let league_id = defaultValues.league_id;
        let order = 'this_month_win_bets';
        let limit = 5;
        const leagueWinBetsListsQuery = await db.sequelize.query(

          `SELECT * FROM users__win__lists uwl INNER JOIN users u ON uwl.uid = u.uid WHERE league_id = ${league_id} ORDER BY ${order} DESC LIMIT ${limit}`,
          {
            type: db.sequelize.QueryTypes.SELECT,
          });

        leagueWinBetsListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinBetsLists.push( repackage(data) );
        });
        //Promise.all(results)
        winBetsLists[key] = leagueWinBetsLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve({ win_bets_lists: winBetsLists });
    return;
  });
}

function repackage(ele) {
  let data = {
    win_bets: '',
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name,
    rank: ''
  };

  data['win_bets'] = ele['this_month_win_bets'];
  data['rank'] = ele['status'];

  return data;
}

module.exports = winBetsLists;