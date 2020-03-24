const modules = require('../../util/modules');
const giveTitleModel = require('../../model/admin/giveTitleModel');

async function giveTitle(req, res) {
  const schema = {
    type: 'object',
    required: ['uid', 'rank', 'sport', 'league'],
    properties: {
      uid: {
        type: 'string'
      },
      rank: {
        type: 'integer',
        maximum: 4,
        minimum: 1
      },
      sport: {
        type: 'integer',
        // baseball, basketball, ice_hockey, soccer
        enum: [16, 18, 17, 1]
      },
      league: { type: 'string' }
    },
    allOf: [
      {
        if: {
          properties: {
            sport: {
              const: 16
            }
          }
        },
        then: {
          properties: {
            league: {
              enum: [
                'CPBL', // 中華職棒
                'LMB', // 墨西哥職棒
                'KBO', // 韓國職棒
                'MLB', // 美國職棒
                'NPB', // 日本職棒
                'ABL' // 澳洲職棒
              ]
            }
          }
        }
      },
      {
        if: {
          properties: {
            sport: {
              const: 18
            }
          }
        },
        then: {
          properties: {
            league: {
              enum: [
                'SBL',
                'JPBL', // 日本職籃
                'KBL', // 韓國職籃
                'NBL', // 澳洲職籃
                'NBA',
                'WNBA',
                'CBA' //  中國職籃
              ]
            }
          }
        }
      },
      {
        if: {
          properties: {
            sport: {
              const: 17
            }
          }
        },
        then: {
          properties: {
            league: {
              enum: ['NHL']
            }
          }
        }
      },
      {
        if: {
          properties: {
            sport: {
              const: 1
            }
          }
        },
        then: {
          properties: {
            league: {
              enum: ['SOCCER']
            }
          }
        }
      }
    ]
  };

  const args = req.body;
  args.adminUid = req.adminUid;
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  try {
    res.json(await giveTitleModel(args));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = giveTitle;

/**
 * @api {post} /admin/giveTitle Give Title
 * @apiVersion 1.0.0
 * @apiDescription 管理員給使用者頭銜 by Tsai-Chieh
 *
 * @apiName giveTitle
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} uid user uid
 * @apiParam {Integer} rank user rank, maximum: 4, minimum: 1. rank `1`: 鑽石大神, rank `2`: 金牌大神, rank `3`: 銀牌大神, rank `4`: 銅牌大神
 * @apiParam {Integer} sport user sport, enum: `16`(baseball), `18`(basketball), `17`(ice_hockey), `1`(soccer)
 * @apiParam {String} league user league, enum pair: [16(`CPBL`(中華職棒), `LMB`(墨西哥職棒), `KBO`(韓國職棒), `MLB`, `NPB`(日本職棒), `ABL`(澳洲職棒)), 18(`SBL`, `JPBL`(日本職籃), `KBL`(韓國職籃), `NBL`(澳洲職籃), `NBA`, `WNBA`, `CBA`(中國職籃)), 17(`NHL`), 1(`SOCCER`(足球))]

 * @apiParamExample {JSON} Request-Example
 * {
 *     "uid": "eIQXtxPrBFPW5daGMcJSx4AicAQ2",
 *     "rank": 1,
 *     "sport": 16,
 *     "league": "ABL"
 * }
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
 *    "uid": "eIQXtxPrBFPW5daGMcJSx4AicAQ2",
 *    "title": [
 *        {
 *              "rank": 2,
 *              "sport": 16,
 *              "league": "中華職棒"
 *        }
 *     ]
 *  }
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [[
    {
        "keyword": "enum",
        "dataPath": ".league",
        "schemaPath": "#/allOf/0/then/properties/league/enum",
        "params": {
            "allowedValues": [
                "中華職棒",
                "墨西哥職棒",
                "韓國職棒",
                "MLB",
                "日本職棒",
                "澳洲職棒"
            ]
        },
        "message": "should be equal to one of the allowed values"
    },
    {
        "keyword": "if",
        "dataPath": "",
        "schemaPath": "#/allOf/0/if",
        "params": {
            "failingKeyword": "then"
        },
        "message": "should match \"then\" schema"
    }
]
 *
 * @apiErrorExample {JSON} 401-Response
 * HTTP/1.1 401 Unauthorized
 * {
    "code": 401,
    "error": "Unauthorized"
}
* @apiErrorExample {JSON} 403-Response
 * HTTP/1.1 403 Forbidden
 * {
    "code": 403,
    "error": "forbidden, this user had the same title"
}
* @apiErrorExample {JSON} 403-Response
 * HTTP/1.1 403 Forbidden
{
    "code": 403,
    "error": "forbidden, admin could not have a title"
}
 * @apiErrorExample {JSON} 404-Response
 * HTTP/1.1 404 Not Found
 * {
    "code": 404,
    "error": "user not found"
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
