const modules = require('../../util/modules');
const model = require('../../model/sport/prematchModel');

async function prematch(req, res) {
  const schema = {
    type: 'object',
    required: ['date', 'league'],
    properties: {
      date: {
        type: 'string',
        format: 'date'
      },
      league: {
        type: 'string',
        enum: ['NBA']
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
module.exports = prematch;
/**
 * @api {GET} /sport/prematch?date=2020-02-28&league=NBA Get Prematch
 * @apiVersion 1.0.0
 * @apiDescription [Test version] Get prematch information included home & away team name, lineups and match scheduled time by TsaiChieh
 * @apiName prematch information
 * @apiGroup Sport
 *
 * @apiParam {String} prematch date, ex: ```2020-02-28```
 * @apiParam {String} league league name, the value enum are: ```NBA```
 *
 * @apiParamExample {JSON} Request-Query
 * {
 *    "date": '2020-02-28',
 *    "league": 'NBA'
 * }
 * @apiSuccess {String} id match id
 * @apiSuccess {Number} scheduled return the numeric value corresponding to the scheduled time—the number of seconds elapsed since January 1, 1970 00:00:00 UTC
 * @apiSuccess {Object} home home team information
 * @apiSuccess {String} home.alias team abbreviation name
 * @apiSuccess {String} home.name team name
 * @apiSuccess {String} home.alias_ch team abbreviation Chinese name
 * @apiSuccess {String} home.image_id return image id, the URL is: https://assets.b365api.com/images/team/{image_size: s, m, b}/{image_id}.png, ex: ```https://assets.b365api.com/images/team/b/3414.png```
 * @apiSuccess {String} home.id team id
 * @apiSuccess {Object} away away team information like home Object field, description omitted here
 * @apiSuccess {Object} handicap handicap information included the newest spread & totals
 * @apiSuccess {Object} handicap.spread the newest spread information (which will change based on the request time)
 * @apiSuccess {Number} handicap.spread.handicap handicap
 * @apiSuccess {Number} handicap.spread.add_time handicap add time which betsAPI returned
 * @apiSuccess {Number} handicap.spread.home_odd odd of home team
 * @apiSuccess {Number} handicap.spread.away_odd odd of away team
 * @apiSuccess {Number} handicap.spread.insert_time the time of the data inserted into firestore [debug used] 
 * @apiSuccess {Object} handicap.totals the newest totals information like handicap.spread field, description omitted here
 * @apiSuccess {Object} lineups lineups information which included home & away team, starters for a match are populated around 30 mins for the scheduled start time 
 * @apiSuccess {Object} lineups.home lineups of home team
 * @apiSuccess {String[]} lineups.home.starters just return starters, if need the substitutes, it can tune
 * @apiSuccess {String} lineups.home.starters.name player name
 * @apiSuccess {String} lineups.home.starters.position player primary position
 * @apiSuccess {String} lineups.home.starters.first_name player first name
 * @apiSuccess {String} lineups.home.starters.last_name player last name
 * @apiSuccess {String} lineups.home.starters.id player id
 * @apiSuccess {Object} lineups.away lineups of away team, like lineups.home field, description omitted here
 * 
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * [
    {
        "id": "2106992",
        "scheduled": 1582851600,
        "home": {
            "alias": "IND",
            "name": "Indiana Pacers",
            "alias_ch": "溜馬",
            "image_id": "3414",
            "id": "583ec7cd-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "away": {
            "alias": "POR",
            "name": "Portland Trail Blazers",
            "alias_ch": "拓荒者",
            "image_id": "3419",
            "id": "583ed056-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "handicap": {
            "spread": {
                "30539260": {
                    "handicap": 9.5,
                    "add_time": 1582755227,
                    "home_odd": 1.909,
                    "away_odd": 1.909,
                    "insert_time": 1582779612
                }
            },
            "totals": {
                "33283734": {
                    "handicap": 218,
                    "add_time": 1582755227,
                    "insert_time": 1582779610
                }
            }
        },
        "lineups": {
            "home": {
                "starters": [
                    {
                        "name": "Myles Turner",
                        "position": "C",
                        "first_name": "Myles",
                        "last_name": "Turner",
                        "id": "323f9ef8-ecdd-41a7-859e-dd3db48ba913"
                    },
                    {
                        "name": "Malcolm Brogdon",
                        "position": "PG",
                        "first_name": "Malcolm",
                        "last_name": "Brogdon",
                        "id": "f7134fc8-b298-41fd-933d-d0c4a5d8f6ac"
                    },
                    {
                        "name": "Justin Holiday",
                        "position": "SG",
                        "first_name": "Justin",
                        "last_name": "Holiday",
                        "id": "05dea31d-f1ff-491b-9f17-8be88b26f413"
                    },
                    {
                        "name": "T.J. Warren",
                        "position": "SF",
                        "first_name": "T.J.",
                        "last_name": "Warren",
                        "id": "2ec7092d-e988-4576-ab8b-e3197448fa5d"
                    },
                    {
                        "name": "Victor Oladipo",
                        "position": "SG",
                        "first_name": "Victor",
                        "last_name": "Oladipo",
                        "id": "ae9e275c-9dce-4c10-a108-cfee6958df48"
                    }
                ]
            },
            "away": {
                "starters": [
                    {
                        "name": "Gary Trent Jr.",
                        "position": "PG",
                        "first_name": "Gary",
                        "last_name": "Trent Jr.",
                        "id": "62daf16f-0c4c-46ae-9e54-0d34d6fdef85"
                    },
                    {
                        "name": "Carmelo Anthony",
                        "position": "PF",
                        "first_name": "Carmelo",
                        "last_name": "Anthony",
                        "id": "32688af1-7ac2-432e-b60a-74b9bd89df57"
                    },
                    {
                        "name": "Anfernee Simons",
                        "position": "SG",
                        "first_name": "Anfernee",
                        "last_name": "Simons",
                        "id": "632adcc4-97f1-4e67-a132-e0b79f013c67"
                    },
                    {
                        "name": "CJ McCollum",
                        "position": "SG",
                        "first_name": "CJ",
                        "last_name": "McCollum",
                        "id": "bc70a55a-cee0-478f-9a13-cf51c4a4187c"
                    },
                    {
                        "name": "Trevor Ariza",
                        "position": "SF",
                        "first_name": "Trevor",
                        "last_name": "Ariza",
                        "id": "9392d5b6-3dbf-4375-8fdd-4dafaae6ede4"
                    }
                ]
            }
        }
    }
]
 * @apiError 400 Bad Request
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "format",
        "dataPath": ".date",
        "schemaPath": "#/properties/date/format",
        "params": {
            "format": "date"
        },
        "message": "should match format \"date\""
    }
]
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
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
