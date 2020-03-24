const modules = require('../../util/modules');

function winBetsLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    const defaultValues = await modules.firestore.collection('doSports_settings').doc('home_win_bets').get()
      .then(function(data){
        return data.data()
      });

    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }
    let winBetsLists = {};
    winBetsLists[defaultValues['league']] = []; // 像上面的範例

    try {
      for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
        const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料

        const leagueWinBetsListsQuery = await modules.firestore.collection(`users_win_lists_${key}`)
          .orderBy(`this_month_win_bets`, 'desc')
          .limit(5)
          .get();

        leagueWinBetsListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinBetsLists.push( repackage(data.data()) );
        });
        //Promise.all(results)

        winBetsLists[key] = leagueWinBetsLists;
      }
    } catch (err) {
      console.log('Error in  home/godlists by YuHsien:  %o', err);
      reject({ code: 500, error: err });
      return;
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
    displayname: ele.displayname,
    rank: ''
  };

  data['win_bets'] = ele[`this_month_win_bets`];
  data['rank'] = ele[`rank`];

  return data;
}

module.exports = winBetsLists;
