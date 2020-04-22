// const modules = require('../../util/modules');
const setClaimModel = require('../../model/user/getClaimModel');

async function getClaim (req, res) {
  try {
    res.json(await setClaimModel(req.params));
  } catch (err) {
    res.status(err.code).json(err);
  }
}
module.exports = getClaim;

/**
 * @api {get} /user/getClaim/:uid Get Claim
 * @apiVersion 1.0.0
 * @apiDescription 查看使用者權限等級 by Tsai-Chieh
 *
 * （注意：請使用此使用者 uid: eIQXtxPrBFPW5daGMcJSx4AicAQ2）
 * @apiName getClaim
 * @apiGroup User
 *
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {Number} uid Users unique ID
 * {
 *    "id": eIQXtxPrBFPW5daGMcJSx4AicAQ2
 * };
 * @apiSuccessExample {JSON} Request-Example
 *
 *  HTTP/1.1 200 OK
 * {
 *     "role": 1
 * }
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
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
