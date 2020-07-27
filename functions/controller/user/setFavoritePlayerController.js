const ajv = require('../../util/ajvUtil');
const model = require('../../model/user/setFavoritePlayerModel');
const types = require('../topics/types');
async function favoriteGod(req, res) {
  const league = types.getLeague();
  league.push(null);
  const schema = {
    type: 'object',
    properties: {
      god_uid: {
        type: 'string'
      },
      add: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
          enum: league
        }
      },
      remove: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
          enum: league
        }
      }
    },
    required: ['god_uid']
  };
  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    console.log(ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + ajv.errors[i].dataPath + '\': ' + ajv.errors[i].message);
    }
    res.status(400).json({ code: 400, error: 'schema not acceptable', message: ajv_errs });
    return;
  }
  req.body.token = req.token;
  const args = req.body;

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = favoriteGod;
/**
 * @api {POST} /topics/setFavoritePlayer/ setFavoritePlayer
 * @apiName setFavoritePlayer
 * @apiGroup User
 * @apiDescription 增刪喜歡的使用者
 * @apiPermission login user with completed data
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} god_uid      最愛玩家的ID
 * @apiParam {Array} [add]          要新增什麼聯盟,裡面放`league_id`,沒有要新增不要帶值
 * @apiParam {Array} [remove]       要刪除什麼聯盟,裡面放`league_id`,沒有要刪除不要帶值
 * @apiParamExample {JSON} Request-Example
 * {
 * 	"god_uid": "SkvKosXZIwY23JDDDO7lntPqQ3C2",
 * 	"add": ["CPBL", "NBA"],
 * 	"remove": []
 * }
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200,
 *     "result": [
 *       "NBA",
 *       "CPBL"
 *  ]
 * }
 * @apiErrorExample {JSON} (400-Response) Schema Error
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 400,
 *   "error": "schema not acceptable",
 *   "message": [
 *     "ajv error message"
 *   ]
 * }
 * @apiErrorExample {JSON} (404-Response)
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 404,
 *   "error": "god not found"
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
