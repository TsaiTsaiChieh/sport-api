const modules = require('../../util/modules');

async function winBetsLists(req, res) {
  // 取得 首頁預設值
  const defaultValues = await modules.firestore.collection('backstage').doc('home').get()
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
    return res.status(500);
  }

  return res.status(200).json({ win_bets_lists: winBetsLists });
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
/**
 * @api {get} /winbetslists Get WinBets Lists
 * @apiVersion 1.0.0
 * @apiName winbetslists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of WinBets lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
  "win_bets_lists": {
    "NBA": [
      {
        "win_bets": 65,
        "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "紅色警報",
        "rank": "2"
      },
      {
        "win_bets": 55,
        "uid": "BimYoqVdG3ONxyxZ4Vy855lXc9q2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "中哥大",
        "rank": "2"
      },
      {
        "win_bets": 52,
        "uid": "6wrKIEue8MajxljlsSTujhLWNkm1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "台大科技",
        "rank": ""
      },
      {
        "win_bets": 45,
        "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "運測2人",
        "rank": "3"
      },
      {
        "win_bets": 44,
        "uid": "B30GysZF0rMiIGGAA7FSyraf13D2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "大小人",
        "rank": "2"
      }
    ],
    "MLB": [
      {
        "win_bets": 51,
        "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "紅色警報",
        "rank": ""
      },
      {
        "win_bets": 50,
        "uid": "HppFr8j4sUVSQFKaiTGKjGZmQhw2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "1D7",
        "rank": ""
      },
      {
        "win_bets": 49,
        "uid": "GfSp086CNOd43W89avovuRfsVQn1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "16大學",
        "rank": ""
      },
      {
        "win_bets": 48,
        "uid": "Fu5ygPPjlnaFxB1dsIMDttBHuai1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "森森",
        "rank": ""
      },
      {
        "win_bets": 47,
        "uid": "FdqFph3P2QQ0jymNyENHlJcJVfg1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "超大工具大",
        "rank": ""
      }
    ]
  }
}
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
