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
 * @api {post} /admin/muted mutedUser
 * @apiVersion 1.0.0
 * @apiDescription Admin muted user with uid
 * @apiName Muted user
 * @apiGroup Admin
 * @apiPermission admin
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} uid user uid
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *     "channelId": "public",
 *     "deleteAction": 1
 * }
 * 
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
 *    "Delete message id: 24rzsNJ4DsikbpmfwPGg successful"
 * }
 * @apiError 400 Bad Request
 * @apiError 401 Unauthorized
 * @apiError 403 Forbidden
 * @apiError 404 Not Found
 * @apiError 410 Gone
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
    "error": "message/file can only be retracted within one day"
}
 * @apiErrorExample {JSON} 403-Response
 * HTTP/1.1 403 Forbidden
 * {
    "code": 403,
    "error": "forbidden, please use report function"
}
 * @apiErrorExample {JSON} 404-Response
 * HTTP/1.1 404 Not Found
 * {
    "code": 404,
    "error": "message/file not found"
}
 * @apiErrorExample {JSON} 410-Response
 * HTTP/1.1 410 Gone
 * {
    "code": 410,
    "error": "message/file had been deleted'"
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
