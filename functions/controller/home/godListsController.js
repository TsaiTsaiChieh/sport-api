const modules = require('../../util/modules');
const godListsModel = require('../../model/home/godListsModel');

async function godlists(req, res) {
  try {
    res.json(await godListsModel(req.query));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = godlists;
/**
 * @api {get} /god_lists Get God Lists
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
      "display_name": "大台中哥"
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
