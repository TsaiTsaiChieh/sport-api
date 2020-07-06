const modules = require('../../util/modules');
const model = require('../../model/livescore/livescoreDetailPBPModel');

async function livescore(req, res) {
  const schema = {
    required: ['league', 'eventID'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      },
      eventID: {
        type: 'string'
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = livescore;
/**
 * @api {GET} /livescore/detail/pbp Get the pbp of event
 * @apiVersion 1.0.0
 * @apiDescription [Test version] prematch information of event
 * @apiName livescore detail/pbp
 * @apiGroup Livescore
 *
 * @apiParam {String} league league name, the value are: ```eSoccer```
 * @apiParam {String} eventID ID of event, the value are: ```2371685```
 *
 * @apiParamExample {JSON} Request-Query
 {
   'league' : 'eSoccer'
   'eventID' : '2371685'
 }

* @apiSuccess {String} id id of event
* @apiSuccess {Number} status 0:closed, 1:inprogress, 2:closed
* @apiSuccess {String} sport sport of event
* @apiSuccess {String} league league of event (English)
* @apiSuccess {String} ori_league league of event (Chinese)
* @apiSuccess {String} scheduled start time of event
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

 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
{
  "id": "2371685",
  "status": 0,
  "sport": "esports",
  "league": "eSoccer",
  "ori_league": "職業聯賽－12分鐘",
  "scheduled": 1589566500,
  "spread": {
    "handicap": -0.75,
    "home_tw": null,
    "away_tw": "0.5/1"
  },
  "totals": {
    "handicap": 3.75,
    "over_tw": "3.75"
  },
  "home": {
    "team_name": "加泰羅尼亞",
    "player_name": "CFC",
    "name": "Catalonia FC (CFC)",
    "alias": "Catalonia FC (CFC)",
    "alias_ch": "加泰羅尼亞",
    "image_id": "691981"
  },
  "away": {
    "team_name": "佛斯",
    "player_name": "FRZ",
    "name": "Forze (FRZ)",
    "alias": "Forze (FRZ)",
    "alias_ch": "佛斯",
    "image_id": "691975"
  }
}

 */
