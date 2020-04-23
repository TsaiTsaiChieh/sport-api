/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const mutedModel = require('../../model/admin/mutedModel');

function muted(req, res) {
  const args = {};
  const schema = {
    required: ['uid'],
    uid: {
      type: 'string'
    }
  };
  args.uid = req.body.uid;
  args.admin = req.admin;
  args.adminUid = req.adminUid;
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }

  mutedModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = muted;

/**
 * @api {post} /admin/muted Muted User
 * @apiVersion 1.0.0
 * @apiDescription 管理員禁止某使用者發言，需要使用者登入且為管理員身份，管理員不能禁自己的發言，也不能禁其他管理員的發言
 *
 * 禁第一次，使用者一天內不能發言；禁第二次，三天內不能發言；禁第三次，七天內不能發言，再禁第四次以上，則使用者永久不能發言 by Tsai-Chieh
 *
 * （注意：請使用測試使用者 uid: eIQXtxPrBFPW5daGMcJSx4AicAQ2）
 * @apiName mutedUser
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *     "uid": "eIQXtxPrBFPW5daGMcJSx4AicAQ2"
 * }
 *
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
 *    "data": "Muted user: eIQXtxPrBFPW5daGMcJSx4AicAQ2 successful, this user had been muted 5 times"
 * }
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 404 Not Found
 * @apiError 500 Internal Server Error
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "uid"
        },
        "message": "should have required property 'uid'"
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
    "error": "forbidden, admin cannot mute other admin or himself/herself"
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
