// const modules = require('../../util/modules');
const setClaimModel = require('../../models/admin/getClaimModel');

async function getClaim(req, res) {
  try {
    // const schema = {
    //   type: 'object',
    //   required: ['uid'],
    //   properties: {
    //     uid: {
    //       type: 'string'
    //     }
    //   }
    // };
    // const validate = modules.ajv.validate(schema, req.params);
    // if (!validate) {
    //   res.status(400).json(modules.ajv.errors);
    //   return;
    // }
    res.json(await setClaimModel(req.params));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = getClaim;

/**
 * @api {get} /admin/getClaim/:uid Get Claim
 * @apiVersion 1.0.0
 * @apiDescription 管理員查看使用者權限等級 by Tsai-Chieh
 * 
 * （注意：請使用此使用者 uid: isyoDyVSJBXtD3G7sp9pLW5de7n1）
 * @apiName getClaim
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {Number} uid Users unique ID
 * {
 *    "id": isyoDyVSJBXtD3G7sp9pLW5de7n1
 * }
 * @apiSuccessExample {JSON} Request-Example
 * 
 *  HTTP/1.1 200 OK
 * {
 *     "role": 9
 * }
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
