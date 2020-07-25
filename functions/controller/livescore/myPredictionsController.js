const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/livescore/myPredictionsModel');

async function predictions(req, res) {
  const now = new Date();
  const today = modules.convertTimezoneFormat(Math.floor(now / 1000));
  const schema = {
    type: 'object',
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);

  // append required parameter to model
  const args = {
    uid: req.token.uid,
    league: req.query.league,
    now,
    today
  };

  try {
    res.json(await model(args));
  } catch (err) {
    console.error('Error in controller/livescore/predictions by TsaiChieh', err);
    res.status(err.code)
      .json(err.isPublic
        ? { error: err.name, devcode: err.status, message: err.message }
        : err.code);
  }
}

module.exports = predictions;
/**
 * @api {GET} /livescore/my_predictions?league=eSoccer 個人即時比分頁-我的預測
 * @apiVersion 2.0.0
 * @apiDescription Get the user predictions including match information on today by TsaiChieh
 * @apiName my predictions
 * @apiGroup Livescore
 *
 * @apiParam {String} league league name, the value enum are: `NBA`, `eSoccer`, `KBO`
 *
 * @apiSuccess {Object} match match object
 * @apiSuccess {String} match.id match id
 * @apiSuccess {Number} match.scheduled return the numeric value corresponding to the scheduled time—the number of seconds elapsed since January 1, 1970 00:00:00 UTC
 * @apiSuccess {Number} match.scheduled_tw scheduled format
 * @apiSuccess {Number} match.status match status, 2 is scheduled, 1 is in progress, 0 is end
 * @apiSuccess {String} match.league league name
 * @apiSuccess {String} match.ori_league league name in Chinese

 * @apiSuccess {Object} home home team information
 * @apiSuccess {String} home.alias team abbreviation name
 * @apiSuccess {String} home.name team name
 * @apiSuccess {String} home.alias_ch team abbreviation Chinese name
 * @apiSuccess {String} home.image_id return image id, the URL is: https://assets.b365api.com/images/team/{image_size: s, m, b}/{image_id}.png, ex: ```https://assets.b365api.com/images/team/b/3414.png```
 * @apiSuccess {String} home.id team id
 * @apiSuccess {String} [home.points] home points
 * @apiSuccess {Object} away away team information like home Object field, description omitted here
 * @apiSuccess {Object} spread spread information with the newest spread or according to user prediction option
 * @apiSuccess {Object} spread.newest_id the newest spread id (which will change based on the request time)
 * @apiSuccess {Object} spread.handicap 前端可不用理，後端 debug 用
 * @apiSuccess {String} spread.home_tw 讓分主隊台盤顯示（通常主隊顯示客隊就不顯示）
 * @apiSuccess {String} spread.away_tw 讓分客隊台盤顯示（通常客隊顯示主隊就不顯示）
 * @apiSuccess {String} spread.user_predict_id 玩家下注的讓分 id，若沒下就是 null
 * @apiSuccess {String} spread.user_predict 玩家押主或客，若沒下就是 null，可藉由此欄位來判斷要加`受`讓字, ex: 當 away_tw 有值，而玩家下注 home 時，則要加`受`字
 * @apiSuccess {Object} totals totals information with the newest spread or according to user prediction option `前端目前暫時用不到`，以防萬一還是先給 totals object
 * @apiSuccess {Object} totals.newest_id the newest spread id (which will change based on the request time)
 * @apiSuccess {Object} totals.handicap 前端可不用理，後端 debug 用
 * @apiSuccess {String} totals.over_tw 讓分主隊台盤顯示（通常主隊顯示客隊就不顯示）
 * @apiSuccess {String} totals.user_predict_id 玩家下注的讓分 id，若沒下就是 null
 * @apiSuccess {String} totals.user_predict 玩家押大分或小分，若沒下就是 null，可藉由此欄位來判斷要加`受`讓字, ex: 當 over_tw 有值，而玩家下注 under 時，則要加`受`字
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 {
    "scheduled": [
        {
            "match": {
                "id": "2428707",
                "scheduled": 1594373400,
                "scheduled_tw": "05:30 PM",
                "status": 2,
                "league_id": "349",
                "league": "KBO",
                "ori_league": "韓國職棒",
                "sport": "baseball"
            },
            "home": {
                "id": "2407",
                "team_name": "LG Twins",
                "alias": "LG Twins",
                "alias_ch": "LG雙子",
                "player_name": null,
                "image_id": "249969",
                "points": null
            },
            "away": {
                "id": "3353",
                "team_name": "NC Dinos",
                "alias": "NC Dinos",
                "alias_ch": "NC恐龍",
                "player_name": null,
                "image_id": "249973",
                "points": null
            },
            "spread": {
                "newest_id": "4396339",
                "handicap": -1,
                "home_tw": null,
                "away_tw": "1+100",
                "user_predict_id": "4396257",
                "user_predict": "home"
            },
            "totals": {
                "newest_id": "3873645",
                "handicap": 9,
                "over_tw": "9-50",
                "user_predict_id": "3873645",
                "user_predict": "under"
            }
        },
        {
            "match": {
                "id": "2428710",
                "scheduled": 1594373400,
                "scheduled_tw": "05:30 PM",
                "status": 2,
                "league_id": "349",
                "league": "KBO",
                "ori_league": "韓國職棒",
                "sport": "baseball"
            },
            "home": {
                "id": "4202",
                "team_name": "Kia Tigers",
                "alias": "Kia Tigers",
                "alias_ch": "起亞虎",
                "player_name": null,
                "image_id": "249965",
                "points": null
            },
            "away": {
                "id": "269103",
                "team_name": "Kiwoom Heroes",
                "alias": "Kiwoom Heroes",
                "alias_ch": "Kiwoom英雄",
                "player_name": null,
                "image_id": "249975",
                "points": null
            },
            "spread": {
                "newest_id": "4396347",
                "handicap": -1,
                "home_tw": null,
                "away_tw": "1+50",
                "user_predict_id": "4396347",
                "user_predict": "away"
            },
            "totals": {
                "newest_id": null,
                "handicap": null,
                "over_tw": null,
                "user_predict_id": null,
                "user_predict": null
            }
        },
        {
            "match": {
                "id": "2428708",
                "scheduled": 1594373400,
                "scheduled_tw": "05:30 PM",
                "status": 2,
                "league_id": "349",
                "league": "KBO",
                "ori_league": "韓國職棒",
                "sport": "baseball"
            },
            "home": {
                "id": "2408",
                "team_name": "Lotte Giants",
                "alias": "Lotte Giants",
                "alias_ch": "樂天巨人",
                "player_name": null,
                "image_id": "249971",
                "points": null
            },
            "away": {
                "id": "2406",
                "team_name": "Doosan Bears",
                "alias": "Doosan Bears",
                "alias_ch": "斗山熊",
                "player_name": null,
                "image_id": "249961",
                "points": null
            },
            "spread": {
                "newest_id": "4396414",
                "handicap": -2,
                "home_tw": null,
                "away_tw": "2+50",
                "user_predict_id": "4396414",
                "user_predict": "home"
            },
            "totals": {
                "newest_id": null,
                "handicap": null,
                "over_tw": null,
                "user_predict_id": null,
                "user_predict": null
            }
        },
        {
            "match": {
                "id": "2428709",
                "scheduled": 1594373400,
                "scheduled_tw": "05:30 PM",
                "status": 2,
                "league_id": "349",
                "league": "KBO",
                "ori_league": "韓國職棒",
                "sport": "baseball"
            },
            "home": {
                "id": "3354",
                "team_name": "KT Wiz",
                "alias": "KT Wiz",
                "alias_ch": "KT巫師",
                "player_name": null,
                "image_id": "249967",
                "points": null
            },
            "away": {
                "id": "3356",
                "team_name": "Samsung Lions",
                "alias": "Samsung Lions",
                "alias_ch": "三星獅",
                "player_name": null,
                "image_id": "249977",
                "points": null
            },
            "spread": {
                "newest_id": "4396229",
                "handicap": 1,
                "home_tw": "1-100",
                "away_tw": null,
                "user_predict_id": null,
                "user_predict": null
            },
            "totals": {
                "newest_id": "3873458",
                "handicap": 10.5,
                "over_tw": "10+50",
                "user_predict_id": "3873458",
                "user_predict": "under"
            }
        }
    ],
    "inplay": [],
    "end": []
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
