const modules = require('../../util/modules');
const winRateListsModel = require('../../model/rank/winRateListsModel');

async function winRateLists(req, res) {
  const schema = {
    type: 'object',
    required: ['range', 'league'],
    properties: {
      range: {
        type: 'string',
        enum: ['this_period', 'this_week', 'last_week', 'this_month', 'last_month', 'this_season']
      },
      league: {
        type: 'string',
        enum: ['NBA', 'MLB']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(400).json(modules.ajv.errors);
  }

  try {
    res.json(await winRateListsModel(req.query));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = winRateLists;
/**
 * @api {get} /win_rate_lists Get WinRate Lists
 * @apiVersion 1.0.0
 * @apiName winratelists
 * @apiGroup rank
 * @apiPermission None
 *
 * @apiSuccess {JSON} result Available List of WinRate lists
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 {
  "userlists": [
    {
      "uid": "3IB0w6G4V8QUM2Ti3iCIfX4Viux1",
      "avatar": "https://firebasestorage.googleapis.com/v0/b/sport19y0715.appspot.com/o/default%2Favatar%2Fdefault-profile-avatar.jpg?alt=media&token=7753385f-5457-4fe2-af8e-acef75fcccd8",
      "displayname": "紅色警報2",
      "win_rate": 3
    },
    {
      "uid": "40lFV6SJAVYpw0zZbIuUp7gL9Py2",
      "avatar": "https://firebasestorage.googleapis.com/v0/b/sport19y0715.appspot.com/o/avatar%2F9f7ISNv4o5WSpzlpzy8p0iPbMR13%2F187345C4-A9D9-4CBA-8686-FA264C4B08B8.jpeg?alt=media&token=a1a09405-cfa9-4d03-9447-35b292d2360d",
      "displayname": "炸裂設計師",
      "win_rate": 3,
      "rank": 2,
      "default_title": 1,
      "continue": 6,
      "predict_rate": [
        10,
        6,
        5
      ],
      "predict_rate2": [
        10,
        5
      ],
      "win_bets_continue": 6,
      "matches_rate": [
        6,
        4
      ],
      "matches_continue": 6
    },
    {
      "uid": "2WMRgHyUwvTLyHpLoANk7gWADZn1",
      "avatar": "https://png.pngtree.com/png-clipart/20190629/original/pngtree-cartoon-dinosaur-hand-drawn-cute-commercial-elements-png-image_4068875.jpg",
      "displayname": "台中大哥大",
      "win_rate": 1,
      "rank": 2,
      "default_title": 1,
      "continue": 10,
      "predict_rate": [
        14,
        11,
        9
      ],
      "predict_rate2": [
        14,
        9
      ],
      "win_bets_continue": 10,
      "matches_rate": [
        10,
        8
      ],
      "matches_continue": 10
    }
  ]
}
*
* @apiError 400 Bad Request
*
* @apiErrorExample {JSON} 400-Response
* HTTP/1.1 400 Bad Request
* [
  {
    "keyword": "enum",
    "dataPath": ".range",
    "schemaPath": "#/properties/range/enum",
    "params": {
      "allowedValues": [
        "this_period",
        "this_week",
        "last_week",
        "this_month",
        "last_month",
        "this_session"
      ]
    },
    "message": "should be equal to one of the allowed values"
  }
]
 *
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 Internal Server Error
 */
