const winBetsListsModel = require('../../model/home/winBetsListsModel');

async function winBetsLists(req, res) {
  try {
    res.json(await winBetsListsModel(req.query));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = winBetsLists;
/**
 * @api {get} /win_bets_lists Get WinBets Lists
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
        "display_name": "紅色警報",
        "rank": "2"
      },
      {
        "win_bets": 55,
        "uid": "BimYoqVdG3ONxyxZ4Vy855lXc9q2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "中哥大",
        "rank": "2"
      },
      {
        "win_bets": 52,
        "uid": "6wrKIEue8MajxljlsSTujhLWNkm1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "台大科技",
        "rank": ""
      },
      {
        "win_bets": 45,
        "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "運測2人",
        "rank": "3"
      },
      {
        "win_bets": 44,
        "uid": "B30GysZF0rMiIGGAA7FSyraf13D2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "大小人",
        "rank": "2"
      }
    ],
    "MLB": [
      {
        "win_bets": 51,
        "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "紅色警報",
        "rank": ""
      },
      {
        "win_bets": 50,
        "uid": "HppFr8j4sUVSQFKaiTGKjGZmQhw2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "1D7",
        "rank": ""
      },
      {
        "win_bets": 49,
        "uid": "GfSp086CNOd43W89avovuRfsVQn1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "16大學",
        "rank": ""
      },
      {
        "win_bets": 48,
        "uid": "Fu5ygPPjlnaFxB1dsIMDttBHuai1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "森森",
        "rank": ""
      },
      {
        "win_bets": 47,
        "uid": "FdqFph3P2QQ0jymNyENHlJcJVfg1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "超大工具大",
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
