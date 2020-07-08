const modules = require('../../util/modules');
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

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);

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
 * @apiVersion 1.0.0
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
 * @apiSuccess {Object} spread spread information with the newest spread
 * @apiSuccess {Object} spread.id the newest spread id (which will change based on the request time)
 * @apiSuccess {String} spread.home_tw 讓分主隊台盤顯示（通常主隊顯示客隊就不顯示）
 * @apiSuccess {String} spread.away_tw 讓分客隊台盤顯示（通常客隊顯示主隊就不顯示）
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
  "scheduled": [

  ],
  "inplay": [
    {
      "match": {
        "id": "2505530",
        "scheduled": 1593673560,
        "scheduled_tw": "03:06 PM",
        "status": 1,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "338927",
          "team_name": "Atletico Madrid (vrico)",
          "alias": "Atletico Madrid",
          "alias_ch": "馬德里競技",
          "player_name": "vrico",
          "image_id": "721393",
          "points": null
        },
        "away": {
          "id": "338928",
          "team_name": "Barcelona (Skromnuy)",
          "alias": "Barcelona",
          "alias_ch": "巴塞隆納",
          "player_name": "Skromnuy",
          "image_id": "712675",
          "points": null
        },
        "spread": {
          "id": "53061370",
          "handicap": 0,
          "home_tw": "pk",
          "away_tw": null
        }
      }
    }
  ],
  "end": [
    {
      "match": {
        "id": "2505208",
        "scheduled": 1593655200,
        "scheduled_tw": "10:00 AM",
        "status": 0,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "330842",
          "team_name": "Chelsea (KRaftVK)",
          "alias": "Chelsea",
          "alias_ch": "切爾西",
          "player_name": "KRaftVK",
          "image_id": "695743",
          "points": 0
        },
        "away": {
          "id": "348195",
          "team_name": "AC Milan (MeLToSiK)",
          "alias": "AC Milan",
          "alias_ch": "AC 米蘭",
          "player_name": "MeLToSiK",
          "image_id": "724607",
          "points": 3
        },
        "spread": {
          "id": "53058095",
          "handicap": 0,
          "home_tw": "pk",
          "away_tw": null
        }
      }
    },
    {
      "match": {
        "id": "2505209",
        "scheduled": 1593655200,
        "scheduled_tw": "10:00 AM",
        "status": 0,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "331244",
          "team_name": "Napoli (Upcake22)",
          "alias": "Napoli",
          "alias_ch": "那不勒斯",
          "player_name": "Upcake22",
          "image_id": "724363",
          "points": 0
        },
        "away": {
          "id": "331072",
          "team_name": "Inter (labotryas)",
          "alias": "Inter",
          "alias_ch": "國際米蘭",
          "player_name": "labotryas",
          "image_id": "695217",
          "points": 3
        },
        "spread": {
          "id": "53058092",
          "handicap": 0.25,
          "home_tw": "0/0.5",
          "away_tw": null
        }
      }
    },
    {
      "match": {
        "id": "2505212",
        "scheduled": 1593656640,
        "scheduled_tw": "10:24 AM",
        "status": 0,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "331072",
          "team_name": "Inter (labotryas)",
          "alias": "Inter",
          "alias_ch": "國際米蘭",
          "player_name": "labotryas",
          "image_id": "695217",
          "points": 1
        },
        "away": {
          "id": "348195",
          "team_name": "AC Milan (MeLToSiK)",
          "alias": "AC Milan",
          "alias_ch": "AC 米蘭",
          "player_name": "MeLToSiK",
          "image_id": "724607",
          "points": 1
        },
        "spread": {
          "id": "53058093",
          "handicap": 0.25,
          "home_tw": null,
          "away_tw": "0/0.5"
        }
      }
    },
    {
      "match": {
        "id": "2505213",
        "scheduled": 1593656640,
        "scheduled_tw": "10:24 AM",
        "status": 0,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "331244",
          "team_name": "Napoli (Upcake22)",
          "alias": "Napoli",
          "alias_ch": "那不勒斯",
          "player_name": "Upcake22",
          "image_id": "724363",
          "points": 1
        },
        "away": {
          "id": "348514",
          "team_name": "Arsenal (Kray)",
          "alias": "Arsenal",
          "alias_ch": "阿森納",
          "player_name": "Kray",
          "image_id": "725115",
          "points": 0
        },
        "spread": {
          "id": "53058098",
          "handicap": 0,
          "home_tw": "pk",
          "away_tw": null
        }
      }
    },
    {
      "match": {
        "id": "2505462",
        "scheduled": 1593669600,
        "scheduled_tw": "02:00 PM",
        "status": 0,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "333147",
          "team_name": "Man Utd (nikkitta)",
          "alias": "Man Utd",
          "alias_ch": "曼徹斯特聯",
          "player_name": "nikkitta",
          "image_id": "697851",
          "points": 0
        },
        "away": {
          "id": "330382",
          "team_name": "Arsenal (dm1trena)",
          "alias": "Arsenal",
          "alias_ch": "阿森納",
          "player_name": "dm1trena",
          "image_id": "700225",
          "points": 0
        },
        "spread": {
          "id": "53060631",
          "handicap": 0.25,
          "home_tw": "0/0.5",
          "away_tw": null
        }
      }
    },
    {
      "match": {
        "id": "2505525",
        "scheduled": 1593671400,
        "scheduled_tw": "02:30 PM",
        "status": 0,
        "league": "22000",
        "ori_league": "足球電競之戰－8分鐘",
        "home": {
          "id": "338928",
          "team_name": "Barcelona (Skromnuy)",
          "alias": "Barcelona",
          "alias_ch": "巴塞隆納",
          "player_name": "Skromnuy",
          "image_id": "712675",
          "points": 1
        },
        "away": {
          "id": "337384",
          "team_name": "Sevilla (LaikingDast)",
          "alias": "Sevilla",
          "alias_ch": "塞維利亞",
          "player_name": "LaikingDast",
          "image_id": "714697",
          "points": 0
        },
        "spread": {
          "id": "53061367",
          "handicap": 0.5,
          "home_tw": "0.5",
          "away_tw": null
        }
      }
    }
  ]
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
