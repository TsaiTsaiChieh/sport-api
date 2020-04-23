const modules = require('../../util/modules');
const givePointsModel = require('../../model/admin/givePointsModel');
function givePoints(req, res) {
  const schema = {
    type: 'object',
    required: ['uid', 'points'],
    properties: {
      uid: {
        type: 'string'
      },
      points: {
        type: 'integer'
      }
    }
  };
  const args = {};
  args.uid = req.body.uid;
  args.points = req.body.points;
  args.token = req.token;

  const valid = modules.ajv.validate(schema, args);

  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  givePointsModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = givePoints;

/**
 * @api {post} /admin/givePoints Give Points
 * @apiVersion 1.0.0
 * @apiDescription 管理員給使用者點數 by Tsai-Chieh
 *
 * （注意：請使用測試使用者 uid: eIQXtxPrBFPW5daGMcJSx4AicAQ2）
 * @apiName givePoints
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} uid user uid
 * @apiParam {Integer} points points to give
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *     "uid": "eIQXtxPrBFPW5daGMcJSx4AicAQ2",
 *     "points": 200
 * }
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
 *    "uid": "eIQXtxPrBFPW5daGMcJSx4AicAQ2",
 *    "currentPoints": 77
 * }
 *
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [[
    {
        "keyword": "type",
        "dataPath": ".points",
        "schemaPath": "#/properties/points/type",
        "params": {
            "type": "integer"
        },
        "message": "should be integer"
    }
]
 *
 * @apiErrorExample {JSON} 401-Response
 * HTTP/1.1 401 Unauthorized
 * {
    "code": 401,
    "error": "Unauthorized"
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
