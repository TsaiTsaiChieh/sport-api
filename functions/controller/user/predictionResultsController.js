const modules = require('../../util/modules');
const model = require('../../model/user/predictionResultsModel');

async function predictionResult(req, res) {
  const schema = {
    type: 'object',
    required: ['date'],
    properties: {
      date: {
        type: 'string',
        format: 'date',
        // default value is today
        default: modules.convertTimezoneFormat(Math.floor(Date.now() / 1000),
          { format: 'YYYY-MM-DD' })
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  const args = {
    token: req.token,
    date: req.query.date
  };
  try {
    res.json(await model(args));
  } catch (err) {
    console.error(err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = predictionResult;
/**
 * @api {post} /user/prediction_result Prediction results
 * @apiVersion 1.0.0
 * @apiDescription User check own prediction form which is settled by Tsai-Chieh
 * @apiName Check own prediction form
 * @apiGroup User
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} [date] date, ex: `2020-07-01`
 *
 * @apiParamExample {JSON} Request-Example
{
  "date": "2020-07-01"
}
 * @apiSuccess {Number} bets 注數乘以賠率
 * @apiSuccess {end} 有無過盤，1 過盤，0 平盤，-1 未過盤
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
{
    "eSoccer": [
        {
            "id": "2331650",
            "scheduled": 1593558000,
            "scheduled_tw": "AM 07:00",
            "league_id": "22000",
            "league": "eSoccer",
            "home": {
                "id": "332756",
                "alias": "Kenny Bell FC",
                "alias_ch": "Kenny Bell FC",
                "player_name": null,
                "points": 1
            },
            "away": {
                "id": "332755",
                "alias": "Boston River",
                "alias_ch": "Boston River",
                "player_name": null,
                "points": 0
            },
            "spread": {
                "id": "50150778",
                "handicap": 1,
                "home_tw": "主讓1分平",
                "away_tw": null,
                "predict": "away",
                "ori_bets": 1,
                "result": -2,
                "end": null,
                "bets": null
            },
            "totals": {
                "id": null,
                "handicap": null,
                "over_tw": null,
                "predict": null,
                "ori_bets": null,
                "result": null
            }
        }
    ],
    "NBA": [
        {
            "id": "2118058",
            "scheduled": 1593558000,
            "scheduled_tw": "AM 07:00",
            "league_id": "2274",
            "league": "NBA",
            "home": {
                "id": "54379",
                "alias": "LAL",
                "alias_ch": "湖人",
                "player_name": null,
                "points": 102
            },
            "away": {
                "id": "54759",
                "alias": "BKN",
                "alias_ch": "籃網",
                "player_name": null,
                "points": 104
            },
            "spread": {
                "id": "31247649",
                "handicap": 12,
                "home_tw": "12平",
                "away_tw": null,
                "predict": "away",
                "ori_bets": 1,
                "result": 0.95,
                "end": 1,
                "bets": 0.95
            },
            "totals": {
                "id": "34366105",
                "handicap": 225.5,
                "over_tw": "225.5",
                "predict": "under",
                "ori_bets": 2,
                "result": 0.95,
                "end": 1,
                "bets": 1.9
            }
        },
        {
            "id": "2119917",
            "scheduled": 1593565200,
            "scheduled_tw": "AM 09:00",
            "league_id": "2274",
            "league": "NBA",
            "home": {
                "id": "54379",
                "alias": "LAL",
                "alias_ch": "湖人",
                "player_name": null,
                "points": null
            },
            "away": {
                "id": "52640",
                "alias": "HOU",
                "alias_ch": "火箭",
                "player_name": null,
                "points": null
            },
            "spread": {
                "id": "31296152",
                "handicap": 6.5,
                "home_tw": "6輸",
                "away_tw": null,
                "predict": "home",
                "ori_bets": 3,
                "result": -1,
                "end": -1,
                "bets": -3
            },
            "totals": {
                "id": "34452129",
                "handicap": 231.5,
                "over_tw": "231.5",
                "predict": "over",
                "ori_bets": 1,
                "result": -2,
                "end": null,
                "bets": null
            }
        }
    ]
}

 * @apiError 400 Bad Request
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
