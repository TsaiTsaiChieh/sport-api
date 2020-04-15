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
    res.json(await model(req.args));
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
 * @apiSuccess {Number} status match status, 2 is scheduled, 1 is in progress, 0 is end
 * @apiSuccess {Object} home home team information
 * @apiSuccess {String} home.alias team abbreviation name
 * @apiSuccess {String} home.name team name
 * @apiSuccess {String} home.alias_ch team abbreviation Chinese name
 * @apiSuccess {String} home.image_id return image id, the URL is: https://assets.b365api.com/images/team/{image_size: s, m, b}/{image_id}.png, ex: ```https://assets.b365api.com/images/team/b/3414.png```
 * @apiSuccess {String} home.id team id
 * @apiSuccess {Object} away away team information like home Object field, description omitted here
 * @apiSuccess {Object} handicap handicap information included the newest spread & totals
 * @apiSuccess {Object} handicap.spread the newest spread information (which will change based on the request time)
 * @apiSuccess {String}} handicap.spread.id handicap id
 * @apiSuccess {Number} handicap.spread.handicap handicap
 * @apiSuccess {String} handicap.spread.handicap_tw handicap format in Taiwan
 * @apiSuccess {Number} handicap.spread.add_time handicap add time which betsAPI returned
 * @apiSuccess {Number} handicap.spread.insert_time the time of the data inserted into firestore [debug used] 
 * @apiSuccess {Object} handicap.totals the newest totals information like handicap.spread field, description omitted here
 * 
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * [
    {
        "id": "2119439",
        "scheduled": 1593559800,
        "league": "NBA",
        "status": 0,
        "home": {
            "alias": "POR",
            "name": "Portland Trail Blazers",
            "alias_ch": "拓荒者",
            "image_id": "3414",
            "id": "583ed056-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "away": {
            "alias": "PHX",
            "name": "Phoenix Suns",
            "alias_ch": "太陽",
            "image_id": "3416",
            "id": "583ecfa8-fb46-11e1-82cb-f4ce4684ea4c"
        },
        "spread": {
            "id": "31216615",
            "handicap": 4.5,
            "add_time": 1583831300,
            "home_tw": "4輸",
            "disable": true
        },
        "totals": {
            "id": "34334734",
            "handicap": 233,
            "add_time": 1583849975,
            "away_tw": "大233",
            "disable": true
        }
    },
    {
        "id": "2000000",
        "scheduled": 1593561600,
        "league": "NBA",
        "status": 1,
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
            "id": "spread_4",
            "handicap": 7,
            "add_time": 1583912049,
            "away_tw": "+7 +50",
            "disable": true
        },
        "totals": {
            "id": "totals_2",
            "handicap": 113,
            "add_time": 1583933203,
            "away_tw": "大113",
            "disable": true
        }
    },
    {
        "id": "2114519",
        "scheduled": 1593563400,
        "league": "NBA",
        "status": 2,
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
            "id": "31267231",
            "handicap": 11.5,
            "add_time": 1583926710,
            "home_tw": "11輸",
            "disable": true
        },
        "totals": {
            "id": "34409340",
            "handicap": 214.5,
            "add_time": 1583934276,
            "away_tw": "大214.5",
            "disable": true
        }
    },
    {
        "id": "2115973",
        "scheduled": 1593565200,
        "league": "NBA",
        "status": 2,
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
            "id": "31268919",
            "handicap": 10.5,
            "add_time": 1583934483,
            "home_tw": "10輸",
            "disable": true
        },
        "totals": {
            "id": "34417671",
            "handicap": 210.5,
            "add_time": 1583945384,
            "away_tw": "大210.5",
            "disable": true
        }
    },
    {
        "id": "2117403",
        "scheduled": 1593568800,
        "league": "NBA",
        "status": 2,
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
            "id": "31194971",
            "handicap": 12.5,
            "add_time": 1583788130,
            "home_tw": "12輸",
            "disable": true
        },
        "totals": {
            "id": "34333969",
            "handicap": 245,
            "add_time": 1583846112,
            "away_tw": "大245",
            "disable": true
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
