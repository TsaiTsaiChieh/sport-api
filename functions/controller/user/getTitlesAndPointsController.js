/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const getTitlesAndPointsModel = require('../../model/user/getTitlesAndPointsModel');

async function getTitlesAndPoints(req, res) {
  const schema = {
    type: 'object',
    required: ['uid'],
    properties: {
      uid: {
        type: 'string'
      }
    }
  };
  const args = {};
  args.uid = req.params.uid;
  const validate = modules.ajv.validate(schema, args);
  if (!validate) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  args.token = req.token;
  try {
    res.json(await getTitlesAndPointsModel(args));
  } catch (err) {
    console.log('err....', err);
    res.status(err.code).json(err);
  }
}

module.exports = getTitlesAndPoints;

/**
 * @api {get} /user/getTitlesAndPoints/:uid Get Titles And Points
 * @apiVersion 1.0.1
 * @apiDescription 看使用者的的頭銜和點數 by Tsai-Chieh
 * 
 * @apiName getTitlesAndPoints
 * @apiGroup User
 *
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {Number} uid Users unique ID
 * {
 *    "uid": X6umtiqFyRfcuJiKfjsFXrWqICc2
 * }
 * @apiSuccessExample {JSON} Request-Example
 *  HTTP/1.1 200 OK
 * {
 *    "uid": "X6umtiqFyRfcuJiKfjsFXrWqICc2",
 *    "points": 4,
 *    "titles": [
 *        {
 *            "rank": 1,
 *            "league": "足球",
 *            "sport": 1
 *        },
 *        {
 *            "rank": 5,
 *            "league": "中華職棒",
 *            "sport": 16
 *         }
 *     ]
 * }
 * 
 * @apiError 401 Unauthorized
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
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
