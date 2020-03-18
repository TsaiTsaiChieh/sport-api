const modules = require('../../util/modules');

async function godlists(req, res) {
  const godLists = [];

  try {
    // god_recommend 取出是 大神資料 且 有販售
    const godListsQuery = await modules.firestore.collection('god_recommend')
      .where('sell', '==', '1')
      .get();

    const sortedArr = godListsQuery.docs.map(function (doc) {  // 轉換成array
      return doc.data()
    });

    sortedArr.sort(function compare(a, b) { // 進行 order 排序，將來後台可能指定順序
      return a.order > b.order; // 升 小->大
    });

    // 鑽 金 銀 銅 隨機選一個
    arrRandom('NBA', sortedArr, godLists); // 那一個聯盟需要隨機 資料來源陣例 回傳結果陣例
    arrRandom('MLB', sortedArr, godLists);

    await Promise.all(godLists);
  } catch (err) {
    console.log('Error in  home/godlists by YuHsien:  %o', err);
    return res.status(500);
  }

  return res.status(200).json({ godlists: godLists });
}

function getRandom(x) {
  return Math.floor(Math.random()*x);
};

function arrRandom(league, sortedArr, lists) { // 從陣列取得隨機人員
  // 鑽 金 銀 銅 隨機選一個
  const diamondArr = [];
  const godArr = [];
  const silverArr = [];
  const copperArr = [];

  sortedArr.forEach(async function (data) {
    if (data[`sell_${league}`] == '1') {
      switch (data[`${league}_rank`]){
        case '1': diamondArr.push(data); break;
        case '2': godArr.push(data); break;
        case '3': silverArr.push(data); break;
        case '4': copperArr.push(data); break;
        }
      }
  });

  if(diamondArr.length > 0) lists.push(repackage(diamondArr[getRandom(diamondArr.length)]));
  if(godArr.length > 0) lists.push(repackage(godArr[getRandom(godArr.length)]));
  if(silverArr.length > 0) lists.push(repackage(silverArr[getRandom(silverArr.length)]));
  if(copperArr.length > 0) lists.push(repackage(copperArr[getRandom(copperArr.length)]));
}

function repackage(ele) { // 實際資料輸出格式
  data = {
    league_win_lists: {},
    uid: ele.uid,
    avatar: ele.avatar,
    displayname: ele.displayname
  };

  // 大神聯盟戰績表
  // 該聯盟有賣牌才能出現
  if (ele.sell_NBA == '1') {
    data.league_win_lists['NBA'] = { // 聯盟 戰績表
      rank: ele.NBA_rank,
      win_rate: ele.NBA_win_rate,
      continune: ele.NBA_continue, // 連贏Ｎ場
      predict_rate: ele.NBA_predict_rate, // 近N日 N過 N
      predict_rate2: ele.NBA_predict_rate2, // 近N日過 N
      win_bets_continue: ele.NBA_win_bets_continue, // 勝注連過 Ｎ日
      matches_rate: ele.NBA_matches_rate, // 近 Ｎ 場過 Ｎ 場
      matches_continue: ele.NBA_matches_continue // 連贏Ｎ場
    };
  }

  if (ele.sell_MLB == '1') {
    data.league_win_lists['MLB'] = { // 聯盟 戰績表
      rank: ele.MLB_rank,
      win_rate: ele.MLB_win_rate,
      continune: ele.MLB_continue, // 近N日 N過 N
      predict_rate: ele.MLB_predict_rate, // 連贏Ｎ場
      predict_rate2: ele.MLB_predict_rate2, // 近N日過 N
      win_bets_continue: ele.MLB_win_bets_continue, // 勝注連過 Ｎ日
      matches_rate: ele.MLB_matches_rate, // 近 Ｎ 場過 Ｎ 場
      matches_continue: ele.MLB_matches_continue // 連贏Ｎ場
    };
  }

  return data;
}

module.exports = godlists;
/**
 * @api {get} /godlists Get God Lists
 * @apiVersion 1.0.0
 * @apiName godlists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of God lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
{
  "godlists": [
    {
      "league_win_lists": {
        "NBA": {
          "rank": "1",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            7,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "7SuXZ3POPqTTCIBdd6uKWZ9fGiB2",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "大台中哥"
    },
    {
      "league_win_lists": {
        "NBA": {
          "rank": "2",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            7,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "BimYoqVdG3ONxyxZ4Vy855lXc9q2",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "中哥大"
    },
    {
      "league_win_lists": {
        "NBA": {
          "rank": "3",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            7,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        },
        "MLB": {
          "rank": "4",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            6,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "6wrKIEue8MajxljlsSTujhLWNkm1",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "台大科技"
    },
    {
      "league_win_lists": {
        "MLB": {
          "rank": "1",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            6,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "紅色警報"
    },
    {
      "league_win_lists": {
        "MLB": {
          "rank": "2",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            6,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "B30GysZF0rMiIGGAA7FSyraf13D2",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "大小人"
    },
    {
      "league_win_lists": {
        "NBA": {
          "rank": "2",
          "win_rate": 76,
          "continune": 6,
          "predict_rate": [
            17,
            15,
            8
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        },
        "MLB": {
          "rank": "3",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            10,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "運測2人"
    },
    {
      "league_win_lists": {
        "MLB": {
          "rank": "4",
          "win_rate": 80,
          "continune": 8,
          "predict_rate": [
            6,
            5,
            5
          ],
          "predict_rate2": [
            7,
            5
          ],
          "win_bets_continue": 4,
          "matches_rate": [
            10,
            7
          ],
          "matches_continue": 4
        }
      },
      "uid": "FXzqjqFlRygUYu7S20XMqsFNxom1",
      "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
      "displayname": "工儘2"
    }
  ]
}
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
