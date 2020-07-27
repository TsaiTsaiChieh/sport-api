const ajv = require('../../util/ajvUtil');
const model = require('../../model/topics/donateModel');
async function donate(req, res) {
  const schema = {
    type: 'object',
    required: ['article_id', 'type', 'cost'],
    properties: {
      article_id: {
        type: 'integer',
        maximum: 9999999,
        minimum: 0
      },
      type: {
        type: 'string',
        enum: ['coin', 'dividend'] // 搞幣 紅利
      },
      cost: {
        type: 'integer',
        maximum: 99999,
        minimum: 1
      }
    }
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

module.exports = donate;
/**
 * @api {GET} /topics/donate/ donate
 * @apiName donate
 * @apiGroup Topics
 * @apiDescription 打賞文章
 * @apiPermission login user with completed data
 * @apiHeader (Bearer) {String}     Bearer token generate from firebase Admin SDK
 * @apiParam {Integer} article_id   文章ID
 * @apiParam {String} type          用什麼打賞 [`coin`搞幣, `dividend`紅利]
 * @apiParam {Integer} cost         打賞多少錢 (稅前, 使用者輸入實際扣除的金額)
 * @apiParamExample {JSON} Request-Example
 * {
 * 	"article_id": 178,
 * 	"type": "coin",
 * 	"cost": 500
 * }
 * @apiSuccess {JSON} result Response
 * @apiSuccessExample {JSON} Success-Response
 * {
 *   "code": 200
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
 * @apiErrorExample {JSON} (400-Response) Can't Donate Self
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": 400,
 *   "error": "cannot donate self"
 * }
 * @apiErrorExample {JSON} (403-Response) Coin Not Enough
 * HTTP/1.1 403 Forbidden
 * {
 *   "code": 403,
 *   "error": "coin not enough"
 * }
 * @apiErrorExample {JSON} (403-Response) Dividend Not Enough
 * HTTP/1.1 403 Forbidden
 * {
 *   "code": 403,
 *   "error": "dividend not enough"
 * }
 * @apiErrorExample {JSON} (404-Response) Article or User Not Found
 * HTTP/1.1 404 Not Found
 * {
 *   "code": 404,
 *   "error": "article not found"
 * }
 * @apiErrorExample {JSON} (500-Response)
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "code": 500,
 *   "error": {}
 * }
 */
