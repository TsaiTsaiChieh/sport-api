const ajv = require('../../util/ajvUtil');
const messageModel = require('../../model/message/deleteMessageWithId');

function deleteMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['messageId', 'channelId', 'deleteAction'],
    properties: {
      messageId: { type: 'string' },
      channelId: { type: 'string', enum: ['public'] },
      deleteAction: { type: 'integer', minimum: -1, maximum: 1 }
    }
  };
  const args = {};
  args.messageId = req.params.id;
  args.channelId = req.body.channelId;
  args.deleteAction = req.body.deleteAction; // use ajv module, so don't parse int
  args.token = req.token; // get from verification middleware

  const valid = ajv.validate(schema, args);

  if (!valid) {
    res.status(400).json(ajv.errors);
    return;
  }
  messageModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}

module.exports = deleteMessageWithId;

/**
 * @api {delete} /messages/:id deleteMessage
 * @apiVersion 1.0.0
 * @apiDescription The front-end can only listen to the message which masked after deleting action in the realtime database by Tsai-Chieh
 * @apiName Soft delete message
 * @apiGroup Messages
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {String} channelId currently only `public`, may increase in the future
 * @apiParam {Number} deleteAction delete action for message, only accept `-1` (admin delete), `0` (user retract), `1` (user delete)
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
        "keyword": "maximum",
        "dataPath": ".deleteAction",
        "schemaPath": "#/properties/deleteAction/maximum",
        "params": {
            "comparison": "<=",
            "limit": 1,
            "exclusive": false
        },
        "message": "should be <= 1"
    }
]
 *
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "channelId"
        },
        "message": "should have required property 'channelId'"
    },
    {
        "keyword": "required",
        "dataPath": "",
        "schemaPath": "#/required",
        "params": {
            "missingProperty": "deleteAction"
        },
        "message": "should have required property 'deleteAction'"
    }
]
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
