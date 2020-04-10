const modules = require('../../util/modules');
const errs = require('../../util/errorCode');

function winBetsLists(args) {
  return new Promise(async function(resolve, reject) {
    const range = args.range;
    const league = args.league;

    let winBetsLists = {};
    winBetsLists[league] = []; // 像上面的範例

    try {
      for (const [key, value] of Object.entries(winBetsLists)) { // 依 聯盟 進行排序
        const leagueWinBetsLists = []; // 儲存 聯盟處理完成資料

        const leagueWinBetsListsQuery = await modules.firestore.collection(`users_win_lists_${key}`)
          .orderBy(`${rangeCodebook(range)}`, 'desc')
          .limit(30)
          .get();

        leagueWinBetsListsQuery.forEach(function (data) { // 這裡有順序性
          leagueWinBetsLists.push( repackage(data.data()) );
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
    displayname: ele.displayname,
    rank: ''
  };

  data['win_bets'] = ele[`this_month_win_bets`];
  data['rank'] = ele[`rank`];

  return data;
}

function rangeCodebook(range){
  'this_week', 'last_week', 'this_month', 'last_month', 'this_session'
  switch (range) {
    case 'this_week':
      return 'this_week_win_bets';
    case 'last_week':
      return 'last_week_win_bets';
    case 'this_month':
      return 'this_month_win_bets';
    case 'last_month':
      return 'last_month_win_bets';
    case 'this_session':
      return 'this_session_win_bets';
  }
}

module.exports = winBetsLists;
