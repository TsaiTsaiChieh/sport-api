const modules = require('../../util/modules');
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function winRateLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    let league_id = 'league_id';
    const defaultValues = await db.sequelize.query(
      `SELECT * FROM match__leagues ORDER BY ${league_id} DESC LIMIT 1`,
      {
        type: db.sequelize.QueryTypes.SELECT,
        plain: true,
      })

    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }
    
    let winRateLists = {};
    winRateLists[defaultValues.name] = []; 

    try {
      for (const [key, value] of Object.entries(winRateLists)) { // 依 聯盟 進行排序
        const leagueWinRateLists = []; // 儲存 聯盟處理完成資料
        let league_id = defaultValues.league_id;
        let order = 'this_month_win_rate';
        let limit = 5;
        const leagueWinRateListsQuery = await db.sequelize.query(
          `
          SELECT * 
            FROM users__win__lists uwl, users u 
           WHERE uwl.uid = u.uid 
             and league_id = ${league_id} 
           ORDER BY  ${order} DESC limit ${limit}
          `,
          {
            type: db.sequelize.QueryTypes.SELECT,
          });

        leagueWinRateListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinRateLists.push( repackage(data) );
        });
        //Promise.all(results)

        winRateLists[key] = leagueWinRateLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      return reject(errs.errsMsg('500', '500', err));
    }

    resolve({ win_rate_lists: winRateLists });
    return;
  });
}

function repackage(ele) {
  let data = {
    win_rate: '',
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.display_name,
    rank: ''
  };

  data['win_rate'] = ele['this_month_win_rate'];
  data['rank'] = ele['status'];

  return data;
}

module.exports = winRateLists;