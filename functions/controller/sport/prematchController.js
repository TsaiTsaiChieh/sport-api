const modules = require('../../util/modules');
const model = require('../../model/sport/prematchModel');

// eslint-disable-next-line consistent-return
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
        enum: ['NBA', 'MLB']
      }
    }
  };
  req.args = req.query;
  const valid = modules.ajv.validate(schema, req.args);
  if (!valid) {
    return res.status(400).json(modules.ajv.errors);
  }
  req.args.token = req.token;
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
 * @apiParam {String} prematch date, ex: ```2020-04-01```
 * @apiParam {String} league league name, the value enum are: ```NBA```
 *
 * @apiParamExample {JSON} Request-Query
 * {
 *    "date": '2020-04-01',
 *    "league": 'NBA'
 * }
 * @apiSuccess {String} id match id
 * @apiSuccess {Number} scheduled return the numeric value corresponding to the scheduled time—the number of seconds elapsed since January 1, 1970 00:00:00 UTC
 * @apiSuccess {String} league league name
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
 * @apiSuccess {Number} handicap.spread.insert_time the time of the data inserted into firestore [debug used] 
 * @apiSuccess {Object} handicap.totals the newest totals information like handicap.spread field, description omitted here
 * 
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * [
    {
        "id": "2114519",
        "scheduled": 1585695600,
        "league": NBA,
        "home": {
            "alias": "PHI",
            "name": "Philadelphia 76ers",
            "alias_ch": "76人",
            "image_id": "3420",
            "id": "583ec87d-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "away": {
            "alias": "DET",
            "name": "Detroit Pistons",
            "alias_ch": "活塞",
            "image_id": "3424",
            "id": "583ec928-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "spread": {
            "id": "31268919",
            "handicap": 11.5,
            "add_time": 1583926710,
            "disable": true
        }
        },
        "totals": {            
            "id": "34417671",
            "handicap": 214.5,
            "add_time": 1583934276,
            "disable": true
        }
    },
    {
        "id": "2115973",
        "scheduled": 1585697400,
        "home": {
            "alias": "MIA",
            "name": "Miami Heat",
            "alias_ch": "熱火",
            "image_id": "3435",
            "id": "583ecea6-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "away": {
            "alias": "CHA",
            "name": "Charlotte Hornets",
            "alias_ch": "黃蜂",
            "image_id": "3430",
            "id": "583ec97e-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "spread": {
            "31268919": {
                "handicap": 10.5,
                "add_time": 1583934483,
                "disable": true
            }
        },
        "totals": {
            "34417671": {
                "handicap": 210.5,
                "add_time": 1583945384,
                "disable": true
            }
        }
    },
    {
        "id": "2117403",
        "scheduled": 1585699200,
        "home": {
            "alias": "HOU",
            "name": "Houston Rockets",
            "alias_ch": "火箭",
            "image_id": "3412",
            "id": "583ecb3a-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "away": {
            "alias": "MIN",
            "name": "Minnesota Timberwolves",
            "alias_ch": "灰狼",
            "image_id": "3426",
            "id": "583eca2f-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "spread": {
            "31194971": {
                "handicap": 12.5,
                "add_time": 1583788130,
                "disable": true
            }
        },
        "totals": {
            "34333969": {
                "handicap": 245,
                "add_time": 1583846112,
                "disable": false
            }
        }
    },
    {
        "id": "2117404",
        "scheduled": 1585708200,
        "home": {
            "alias": "GSW",
            "name": "Golden State Warriors",
            "alias_ch": "勇士",
            "image_id": "3428",
            "id": "583ec825-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "away": {
            "alias": "LAC",
            "name": "Los Angeles Clippers",
            "alias_ch": "快艇",
            "image_id": "3425",
            "id": "583ecdfb-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "spread": {
            "31217018": {
                "handicap": -11,
                "add_time": 1583834476,
                "disable": false
            }
        },
        "totals": {
            "34334768": {
                "handicap": 226.5,
                "add_time": 1583850138,
                "disable": true
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
