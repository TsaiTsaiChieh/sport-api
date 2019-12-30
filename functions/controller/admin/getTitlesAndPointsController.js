/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const getTitlesAndPointsModel = require('../../model/admin/getTitlesAndPointsModel');

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
 * @api {get} /admin/getTitlesAndPoints/ Set Claim
 * @apiVersion 1.0.0
 * @apiDescription 管理員修改使用者的權限等級 by Tsai-Chieh
 * 
 * （注意：請使用此使用者 uid: lz3c3ju6G0TilDOdgCQt4I7I8ep1）
 * @apiName setClaim
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} uid user uid
 * @apiParam {Integer} role user uid, `-1`: locked, `0`: sinup but not complete profile, `1`: normal, `2`: god like, `9`: admin
 *
 * @apiParamExample {Number} uid Users unique ID
 * {
 *    "id": isyoDyVSJBXtD3G7sp9pLW5de7n1,
 *    "role": 2
 * }
 * @apiSuccessExample {JSON} Request-Example
 *  HTTP/1.1 200 OK
 * {
 *    "data": "set user: lz3c3ju6G0TilDOdgCQt4I7I8ep1 as role: 1 successfully"
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
