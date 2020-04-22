const modules = require('../../util/modules');
const godListsModel = require('../../model/rank/godListsModel');

async function godlists (req, res) {
  const schema = {
    type: 'object',
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'MLB']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(400).json(modules.ajv.errors);
  }

  try {
    res.json(await godListsModel(req.query));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = godlists;
/**
 * @api {get} /rank/god_lists?league=NBA Get God Lists
 * @apiVersion 1.0.0
 * @apiName godlists
 * @apiGroup rank
 * @apiParam {String} league league name, the value enum are: ```NBA```
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
* @apiError 400 Bad Request
*
* @apiErrorExample {JSON} 400-Response
* HTTP/1.1 400 Bad Request
* [
    {
        "keyword": "enum",
        "dataPath": ".league",
        "schemaPath": "#/properties/league/enum",
        "params": {
            "allowedValues": [
                "NBA"
            ]
        },
        "message": "should be equal to one of the allowed values"
    }
]
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "msg": {}
}
 */
