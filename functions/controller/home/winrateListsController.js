const modules = require('../../util/modules');

async function winRateLists(req, res) {
    let winRateLists = {
        NBA: [],
        MLB: [],
    }

    try {
        for (const [key, value] of Object.entries(winRateLists)) {
            const leagueWinRateLists = [];
            const results = [];

            const leagueWinRateListsQuery = await modules.firestore.collection('users_win_lists')
                .orderBy(`${key}_this_month_win_rate`, 'desc')
                .limit(5)
                .get();

            leagueWinRateListsQuery.forEach(function(data) {
                results.push( data.data() );
            });
    
            results.forEach(async function(data) {
                leagueWinRateLists.push( repackage(key, data) );
            });

            winRateLists[key] = leagueWinRateLists;
        } 
    }catch(err){
        console.log('Error in  home/godlists by YuHsien:  %o', err);
        return res.status(500);
    }

    return res.status(200).json({win_rate_lists: win_rate_lists});
}

function repackage(league, ele) {
    data = {
        win_rate: '',
        uid: ele.uid,
        avatar: ele.avatar,
        displayname: ele.displayname,
        rank: ''
    };

    data['win_rate'] = ele[`${league}_this_month_win_rate`];
    data['rank'] = ele[`${league}_rank`];

    return data;
}

module.exports = winRateLists;
/**
 * @api {get} /winratelists Get Winrate Lists
 * @apiVersion 1.0.0
 * @apiName winratelists
 * @apiGroup home
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of Winrate lists
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
        "displayname": "紅色警報",
        "rank": "2"
      },
      {
        "win_rate": 92,
        "uid": "BimYoqVdG3ONxyxZ4Vy855lXc9q2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "中哥大",
        "rank": "2"
      },
      {
        "win_rate": 91,
        "uid": "FZql5b9sOENEq373y4CiiHOXYe43",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "台大科技",
        "rank": "2"
      },
      {
        "win_rate": 90,
        "uid": "6wrKIEue8MajxljlsSTujhLWNkm1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "台大科技",
        "rank": ""
      },
      {
        "win_rate": 89,
        "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "運測2人",
        "rank": "3"
      }
    ],
    "MLB": [
      {
        "win_rate": 88,
        "uid": "B30GysZF0rMiIGGAA7FSyraf13D2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "大小人",
        "rank": ""
      },
      {
        "win_rate": 78,
        "uid": "Xw4dOKa4mWh3Kvlx35mPtAOX2P52",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "無19",
        "rank": ""
      },
      {
        "win_rate": 78,
        "uid": "FXzqjqFlRygUYu7S20XMqsFNxom1",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "工儘2",
        "rank": ""
      },
      {
        "win_rate": 78,
        "uid": "6ls8rUgG2AQkjSmjh8sN0HoiM7v2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "運測2人",
        "rank": "2"
      },
      {
        "win_rate": 78,
        "uid": "5kICOSoGJjWSExJx1vL56if0p1G2",
        "avatar": "https://chat.doinfo.cc/statics/default-profile-avatar.jpg",
        "displayname": "珊迪",
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
