const modules = require('../../util/modules');
const model = require('../../model/sport/matchesModel');

// eslint-disable-next-line consistent-return
async function getMatches(req, res) {
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
        enum: ['NBA', 'eSoccer']
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
    console.error('Error in sport/matches API by TsaiChieh', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}
module.exports = getMatches;
/**
 * @api {GET} /sport/matches?league=NBA&date=2020-07-01 Get matches
 * @apiVersion 2.0.0
 * @apiDescription Get each match information included home & away team name and match scheduled time by TsaiChieh
 * @apiName match information
 * @apiGroup Sport
 *
 * @apiParam {String} prematch date, ex: ```2020-07-01```
 * @apiParam {String} league league name, the value enum are: ```NBA```
 *
 * @apiParamExample {JSON} Request-Query
 * {
 *    "date": '2020-07-01',
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
 * @apiSuccess {String} [home.points] home points
 * @apiSuccess {Object} away away team information like home Object field, description omitted here
 * @apiSuccess {Object} handicap handicap information included the newest spread & totals
 * @apiSuccess {Object} handicap.spread the newest spread information (which will change based on the request time)
 * @apiSuccess {String} handicap.spread.id handicap id
 * @apiSuccess {Number} handicap.spread.handicap handicap
 * @apiSuccess {String} handicap.spread.handicap_tw handicap format in Taiwan
 * @apiSuccess {String} [handicap.spread.result] handicap result
 * @apiSuccess {Object} handicap.totals the newest totals information like handicap.spread field, description omitted here
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
    "scheduled": [
        {
            "id": "2118809",
            "scheduled": 1593574200,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "MEM",
                "alias_ch": "灰熊",
                "image_id": "3415"
            },
            "away": {
                "alias": "ORL",
                "alias_ch": "魔術",
                "image_id": "3437"
            },
            "spread": {
                "id": "31236860",
                "handicap": 2,
                "home_tw": "2平",
                "away_tw": null,
                "disable": false
            },
            "totals": {
                "id": "34364723",
                "handicap": 218,
                "over_tw": "218",
                "disable": false
            }
        },
        {
            "id": "2118810",
            "scheduled": 1593572400,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "SAC",
                "alias_ch": "國王",
                "image_id": "3413"
            },
            "away": {
                "alias": "NOP",
                "alias_ch": "鵜鶘",
                "image_id": "5539"
            },
            "spread": {
                "id": "31235573",
                "handicap": -1.5,
                "home_tw": null,
                "away_tw": "1輸",
                "disable": false
            },
            "totals": {
                "id": "34458529",
                "handicap": 232,
                "over_tw": "232",
                "disable": false
            }
        },
        {
            "id": "2118816",
            "scheduled": 1593568800,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "CHI",
                "alias_ch": "公牛",
                "image_id": "3409"
            },
            "away": {
                "alias": "CLE",
                "alias_ch": "騎士",
                "image_id": "3432"
            },
            "spread": {
                "id": "31238069",
                "handicap": 4,
                "home_tw": "4平",
                "away_tw": null,
                "disable": false
            },
            "totals": {
                "id": "34346860",
                "handicap": 217.5,
                "over_tw": "217.5",
                "disable": false
            }
        },
        {
            "id": "2119439",
            "scheduled": 1593568800,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "POR",
                "alias_ch": "拓荒者",
                "image_id": "3414"
            },
            "away": {
                "alias": "PHX",
                "alias_ch": "太陽",
                "image_id": "3416"
            },
            "spread": {
                "id": "31249410",
                "handicap": 5.5,
                "home_tw": "5輸",
                "away_tw": null,
                "disable": false
            },
            "totals": {
                "id": "34384039",
                "handicap": 234,
                "over_tw": "234",
                "disable": false
            }
        },
        {
            "id": "2118817",
            "scheduled": 1593567000,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "SAS",
                "alias_ch": "馬刺",
                "image_id": "3429"
            },
            "away": {
                "alias": "DAL",
                "alias_ch": "獨行俠",
                "image_id": "3411"
            },
            "spread": {
                "id": "31237643",
                "handicap": -4,
                "home_tw": "+4 -50",
                "away_tw": null,
                "disable": false
            },
            "totals": {
                "id": "34364794",
                "handicap": 230.5,
                "over_tw": "230.5",
                "disable": false
            }
        },
        {
            "id": "2119917",
            "scheduled": 1593565200,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "LAL",
                "alias_ch": "湖人",
                "image_id": "3427"
            },
            "away": {
                "alias": "HOU",
                "alias_ch": "火箭",
                "image_id": "3412"
            },
            "spread": {
                "id": "31296152",
                "handicap": 6.5,
                "home_tw": "6輸",
                "away_tw": null,
                "disable": false
            },
            "totals": {
                "id": "34452129",
                "handicap": 231.5,
                "over_tw": "231.5",
                "disable": false
            }
        },
        {
            "id": "2120643",
            "scheduled": 1593563400,
            "status": 2,
            "league": "NBA",
            "home": {
                "alias": "OKC",
                "alias_ch": "雷霆",
                "image_id": "3418"
            },
            "away": {
                "alias": "UTA",
                "alias_ch": "爵士",
                "image_id": "3434"
            },
            "spread": {
                "id": "31298793",
                "handicap": 3.5,
                "home_tw": "3輸",
                "away_tw": null,
                "disable": false
            },
            "totals": {
                "id": "34456538",
                "handicap": 218.5,
                "over_tw": "218.5",
                "disable": false
            }
        }
    ],
    "inplay": [
        {
            "id": "2120647",
            "scheduled": 1593559800,
            "status": 1,
            "league": "NBA",
            "home": {
                "alias": "ORL",
                "alias_ch": "魔術",
                "image_id": "3437"
            },
            "away": {
                "alias": "CHI",
                "alias_ch": "公牛",
                "image_id": "3409"
            },
            "spread": {
                "id": "31296159",
                "handicap": 7.5,
                "home_tw": "7輸",
                "away_tw": null,
                "disable": true
            },
            "totals": {
                "id": "34452138",
                "handicap": 217.5,
                "over_tw": "217.5",
                "disable": true
            }
        }
    ],
    "end": [
        {
            "id": "2118058",
            "scheduled": 1593558000,
            "status": 0,
            "league": "NBA",
            "home": {
                "alias": "LAL",
                "alias_ch": "湖人",
                "image_id": "3427",
                "points": 102
            },
            "away": {
                "alias": "BKN",
                "alias_ch": "籃網",
                "image_id": "3436",
                "points": 104
            },
            "spread": {
                "id": "31247649",
                "handicap": 12,
                "home_tw": "12平",
                "away_tw": null,
                "disable": true,
                "result": "away"
            },
            "totals": {
                "id": "34366105",
                "handicap": 225.5,
                "over_tw": "225.5",
                "disable": true,
                "result": "under"
            }
        },
        {
            "id": "2121183",
            "scheduled": 1593558000,
            "status": 0,
            "league": "NBA",
            "home": {
                "alias": "DEN",
                "alias_ch": "老鷹",
                "image_id": "3417",
                "points": 131
            },
            "away": {
                "alias": "NYK",
                "alias_ch": "尼克",
                "image_id": "3421",
                "points": 136
            },
            "spread": {
                "id": "31298870",
                "handicap": 5,
                "home_tw": "5平",
                "away_tw": null,
                "disable": true,
                "result": "home"
            },
            "totals": {
                "id": "34456082",
                "handicap": 232.5,
                "over_tw": "232.5",
                "disable": true,
                "result": "over"
            }
        }
    ]
}
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
