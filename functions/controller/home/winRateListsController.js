const modules = require('../../util/modules');
const winRateListsModel = require('../../model/home/winRateListsModel');

async function winRateLists(req, res) {
  try {
    res.json(await winRateListsModel(req.query));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = winRateLists;
/**
 * @api {get} /win_rate_lists Get WinRate Lists
 * @apiVersion 1.0.0
 * @apiName winratelists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of WinRate lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
  "win_rate_lists": {
    "NBA": [
      {
        "win_rate": 94,
        "uid": "MyOPA8SzgVUq8iARhOa8mzQLC3e2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "紅色警報",
        "rank": "2"
      },
      {
        "win_rate": 92,
        "uid": "BimYoqVdG3ONxyxZ4Vy855lXc9q2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "中哥大",
        "rank": "2"
      },
      {
        "win_rate": 91,
        "uid": "FZql5b9sOENEq373y4CiiHOXYe43",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "台大科技",
        "rank": "2"
      },
      {
        "win_rate": 90,
        "uid": "6wrKIEue8MajxljlsSTujhLWNkm1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "台大科技",
        "rank": ""
      },
      {
        "win_rate": 89,
        "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "運測2人",
        "rank": "3"
      }
    ],
    "MLB": [
      {
        "win_rate": 88,
        "uid": "B30GysZF0rMiIGGAA7FSyraf13D2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "大小人",
        "rank": ""
      },
      {
        "win_rate": 78,
        "uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "無19",
        "rank": ""
      },
      {
        "win_rate": 78,
        "uid": "FXzqjqFlRygUYu7S20XMqsFNxom1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "工儘2",
        "rank": ""
      },
      {
        "win_rate": 78,
        "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "運測2人",
        "rank": "2"
      },
      {
        "win_rate": 78,
        "uid": "5kICOSoGJjWSExJx1vL56if0p1G2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "display_name": "珊迪",
        "rank": "3"
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
