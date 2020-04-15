const modules = require('../../util/modules');
const errs = require('../../util/errorCode');

function winRateLists(args) {
  return new Promise(async function(resolve, reject) {
    // 取得 首頁預設值
    const defaultValues = await modules.firestore.collection('doSports_settings').doc('home_win_rate').get()
    .then(function(data){
      return data.data()
    });

    // 將來如果要用 參數 或 後台參數 來鎖定聯盟，只要把格式改對應格式即可
    // let winRateLists = {
    //   NBA: [],
    //   MLB: []
    // }
    let winRateLists = {};
    winRateLists[defaultValues['league']] = []; // 像上面的範例

    try {
      for (const [key, value] of Object.entries(winRateLists)) { // 依 聯盟 進行排序
        const leagueWinRateLists = []; // 儲存 聯盟處理完成資料

        const leagueWinRateListsQuery = await modules.firestore.collection(`users_win_lists_${key}`)
          .orderBy(`this_month_win_rate`, 'desc')
          .limit(5)
          .get();

        leagueWinRateListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinRateLists.push( repackage(data.data()) );
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
    displayname: ele.displayname,
    rank: ''
  };

  data['win_rate'] = ele[`this_month_win_rate`];
  data['rank'] = ele[`rank`];

  return data;
}

module.exports = winRateLists;