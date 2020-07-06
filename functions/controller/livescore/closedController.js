const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreClosedModel');

async function livescoreClosed(req, res) {
  const schema = {
    required: ['league', 'date'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      },
      date: {
        type: 'string',
        format: 'date'
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);

  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/livescore/livescoreClosed by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}
module.exports = livescoreClosed;
/**
 * @api {GET} /livescore/closed Get Livescore of closed event by DY
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Get information of livescore in livescore page.
 * @apiName livescore information all
 * @apiGroup Livescore
 *
 * @apiParam {String} league league name, the value enum are: ```eSoccer```
 * @apiParam {String} date date of event, the value enum are: ```2020-07-06```
 *
 * @apiParamExample {JSON} Request-Query
 {
   "league" : "eSoccer"
   "date" : 2020-07-06
 }
 * @apiSuccess {String} id match id in BetsAPI
 * @apiSuccess {Number} status 0:closed, 1:inprogress, 2:scheduled
 * @apiSuccess {String} sport category of sport
 * @apiSuccess {String} league english name of league
 * @apiSuccess {String} ori_league chinese name of league
 * @apiSuccess {Number} scheduled the scheduled of this match
 * @apiSuccess {Object} spread information of speard
 * @apiSuccess {Object} spread id of spread
 * @apiSuccess {Number} spread.home_tw the odd of home team about spread
 * @apiSuccess {Number} spread.away_tw the odd of away team about spread
 * @apiSuccess {Number} spread.handicap the handicap about spread
 * @apiSuccess {Object} totals id of totals
 * @apiSuccess {Number} totals.home_tw the odd of home team about totals
 * @apiSuccess {Number} totals.away_tw the odd of away team about totals
 * @apiSuccess {Number} totals.handicap the handicap about totals
 * @apiSuccess {Object} home information about home team
 * @apiSuccess {String} home.name name of home team (English)
 * @apiSuccess {String} home.alias chinese name of home team (English)
 * @apiSuccess {String} home.team_name name of home team (Chinese)
 * @apiSuccess {String} home.player_name name of player (for eSoccer)
 * @apiSuccess {String} home.alias_ch chinese name of home team (Chinese)
 * @apiSuccess {Number} home.image_id image id of home team
 * @apiSuccess {Object} away information about home team
 * @apiSuccess {String} away.name name of home team (English)
 * @apiSuccess {String} away.alias chinese name of home team (English)
 * @apiSuccess {String} away.team_name name of home team (Chinese)
 * @apiSuccess {String} away.player_name name of player (for eSoccer)
 * @apiSuccess {String} away.alias_ch chinese name of home team (Chinese)
 * @apiSuccess {Number} away.image_id image id of away team
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  {
    "id": "2514974",
    "status": 0,
    "sport": "esports",
    "league": "eSoccer",
    "ori_league": "職業聯賽－12分鐘",
    "scheduled": 1593964800,
    "spread": {
      "handicap": 0.25,
      "home_tw": null,
      "away_tw": "0/0.5"
    },
    "home": {
      "team_name": "甘比特",
      "player_name": "GMB",
      "name": "Gambit (GMB)",
      "alias": "Gambit (GMB)",
      "alias_ch": "甘比特",
      "image_id": "695181"
    },
    "away": {
      "team_name": "通達拉",
      "player_name": "TES",
      "name": "Tundra (TES)",
      "alias": "Tundra (TES)",
      "alias_ch": "通達拉",
      "image_id": "691973"
    }
  },
  {
    "id": "2515518",
    "status": 0,
    "sport": "esports",
    "league": "eSoccer",
    "ori_league": "足球電競之戰－8分鐘",
    "scheduled": 1593965160,
    "spread": {
      "handicap": 0,
      "home_tw": "pk",
      "away_tw": null
    },
    "home": {
      "team_name": "巴黎聖日耳曼",
      "player_name": "Hrusch",
      "name": "PSG (Hrusch)",
      "alias": "PSG (Hrusch)",
      "alias_ch": "巴黎聖日耳曼",
      "image_id": "695277"
    },
    "away": {
      "team_name": "曼徹斯特城",
      "player_name": "dm1trena",
      "name": "Man City (dm1trena)",
      "alias": "Man City (dm1trena)",
      "alias_ch": "曼徹斯特城",
      "image_id": "701691"
    }
	}
]
 * @apiError 400 Bad Request
 * @apiError 500 Internal Server Error

 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
