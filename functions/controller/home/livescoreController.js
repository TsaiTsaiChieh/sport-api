const modules = require('../../util/modules');
const model = require('../../model/home/livescoreModel');
async function livescoreHome(req, res) {
  const schema = {
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
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
    console.error('Error in controller/home/livescoreHome by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = livescoreHome;
/**
 * @api {GET} /home/livescore?league=eSoccer Get Livescore by DY
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Get information of livescore in homepage, included score, handicap and information of team. Array of three match.
 * @apiName livescore information
 * @apiGroup Home
 * @apiParam {String} league league name, the value enum are: ```eSoccer```
 * @apiParamExample {JSON} Request-Query
 {
   "league" : "eSoccer"
 }
 * @apiSuccess {String} id match id in BetsAPI
 * @apiSuccess {Number} status 0:closed, 1:inprogress, 2:scheduled
 * @apiSuccess {String} sport category of sport
 * @apiSuccess {String} league chinese name of league
 * @apiSuccess {String} ori_league english name of league
 * @apiSuccess {Number} scheduled the scheduled of this match
 * @apiSuccess {Object} newest_spread information of speard
 * @apiSuccess {Number} newest_spread.home_tw the odd of home team about spread
 * @apiSuccess {Number} newest_spread.away_tw the odd of away team about spread
 * @apiSuccess {Number} newest_spread.handicap the handicap about spread
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

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
[
  {
    "id": "2516605",
    "league": "足球電競之戰－8分鐘",
    "ori_league": "eSoccer",
    "sport": "esports",
    "status": 2,
    "scheduled": 1594011600000,
    "newest_spread": {
      "handicap": 0.25,
      "home_tw": null,
      "away_tw": "0/0.5"
    },
    "home": {
      "team_name": "托特納姆",
      "player_name": "orlovsky1",
      "name": "Tottenham (orlovsky1)",
      "alias": "Tottenham (orlovsky1)",
      "alias_ch": "托特納姆",
      "image_id": "695269"
    },
    "away": {
      "team_name": "阿森納",
      "player_name": "Hrusch",
      "name": "Arsenal (Hrusch)",
      "alias": "Arsenal (Hrusch)",
      "alias_ch": "阿森納",
      "image_id": "713909"
    }
  },
  {
    "id": "2516604",
    "league": "足球電競之戰－8分鐘",
    "ori_league": "eSoccer",
    "sport": "esports",
    "status": 2,
    "scheduled": 1594011600000,
    "newest_spread": {
      "handicap": 0.25,
      "home_tw": "0/0.5",
      "away_tw": null
    },
    "home": {
      "team_name": "曼徹斯特城",
      "player_name": "DangerDim77",
      "name": "Man City (DangerDim77)",
      "alias": "Man City (DangerDim77)",
      "alias_ch": "曼徹斯特城",
      "image_id": "695261"
    },
    "away": {
      "team_name": "利物浦",
      "player_name": "nikkitta",
      "name": "Liverpool (nikkitta)",
      "alias": "Liverpool (nikkitta)",
      "alias_ch": "利物浦",
      "image_id": "697367"
    }
  },
  {
    "id": "2516607",
    "league": "足球電競之戰－8分鐘",
    "ori_league": "eSoccer",
    "sport": "esports",
    "status": 2,
    "scheduled": 1594012320000,
    "newest_spread": {
      "handicap": 0.25,
      "home_tw": "0/0.5",
      "away_tw": null
    },
    "home": {
      "team_name": "利物浦",
      "player_name": "nikkitta",
      "name": "Liverpool (nikkitta)",
      "alias": "Liverpool (nikkitta)",
      "alias_ch": "利物浦",
      "image_id": "697367"
    },
    "away": {
      "team_name": "托特納姆",
      "player_name": "orlovsky1",
      "name": "Tottenham (orlovsky1)",
      "alias": "Tottenham (orlovsky1)",
      "alias_ch": "托特納姆",
      "image_id": "695269"
    }
  },
  {
    "id": "2516606",
    "league": "足球電競之戰－8分鐘",
    "ori_league": "eSoccer",
    "sport": "esports",
    "status": 2,
    "scheduled": 1594012320000,
    "newest_spread": {
      "handicap": 0.25,
      "home_tw": null,
      "away_tw": "0/0.5"
    },
    "home": {
      "team_name": "阿森納",
      "player_name": "Hrusch",
      "name": "Arsenal (Hrusch)",
      "alias": "Arsenal (Hrusch)",
      "alias_ch": "阿森納",
      "image_id": "713909"
    },
    "away": {
      "team_name": "曼徹斯特聯",
      "player_name": "d1pseN",
      "name": "Man Utd (d1pseN)",
      "alias": "Man Utd (d1pseN)",
      "alias_ch": "曼徹斯特聯",
      "image_id": "727079"
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
