/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModel = require('../../model/message/createMessage');

function createMessage(req, res) {
  const schema = {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'object',
        required: ['channelId', 'message', 'type', 'tempHash'],
        properties: {
          channelId: {
            type: 'string',
            enum: ['public'] // enum possible channel name
          },
          message: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: [
              'text',
              'image/jpeg',
              'image/png',
              'video/mp4',
              'video/quicktime'
            ] // message type
          },
          tempHash: {
            type: 'string'
          }
        },
        if: {
          properties: {
            type: {
              enum: ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']
            }
          }
        },
        then: {
          properties: {
            message: {
              type: 'string',
              format: 'url'
            }
          }
        }
      },
      reply: {
        type: 'object',
        required: ['messageId'],
        properties: {
          messageId: {
            type: 'string'
          }
        }
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  req.body.token = req.token;
  messageModel(req.body)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}

module.exports = createMessage;
/**
 * @api {post} /messages createMessage
 * @apiVersion 1.0.0
 * @apiDescription The front-end can only listen to the realtime database and ignore the results of successful JSON responses, and the data structure of the realtime database can refer to the Success-Response of this document
 * @apiName Create or reply a message/file
 * @apiGroup Messages
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam {Object} message message data
 * @apiParam {String} message.channelId currently only `public`, may increase in the future
 * @apiParam {String} message.message message content, plain text or URL
 * @apiParam {String} message.type message type, the value enum are: `text`, `image/jpeg`, `image/png`, `video/mp4`, `video/quicktime`. If the message content is not plain text, message must be a URL
 * @apiParam {String} message.tempHash random string generated by the front-end
 * @apiParam {Object} [reply] optional reply message id
 * @apiParam {String} [reply.messageId] reply message id
 *
 * @apiParamExample {JSON} Request-Example
 * {
 *    "message": {
 *		    "channelId": "public",
 *		    "message": "test123",
 *		    "type": "text",
 *		    "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53"
 *     },
 *     "reply": {
 *	      "messageId": "dPqN20XQnbWNRLNr5Ohe"
 *      }
 * }
 * @apiParamExample {JSON} Request-Example
 * {
 *    "message": {
 *		    "channelId": "public",
 *		    "message": "test123",
 *		    "type": "text",
 *		    "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53"
 *       }
 * }
 * @apiSuccess {Object} createTime firebase format, contain seconds and nanoseconds
 * @apiSuccess {Object} message message data
 * @apiSuccess {Object} user user data
 * @apiSuccess {Object} [reply] reply data, include message and user object, not repeat again
 * 
 * @apiSuccess {String} message.channelId return channel id
 * @apiSuccess {String} message.message return message content, plain text or URL
 * @apiSuccess {String} message.messageId unique id which firebase automated generated for message
 * @apiSuccess {String} message.softDelete whether the message has been deleted, -1: admin delete, 0: user retract (收回), 1: user delete (刪除), 2: normal (default)
 * @apiSuccess {String} message.tempHash return random string generated by the front-end
 * @apiSuccess {String} message.type return message type
 *
 * @apiSuccess {String} user.avatar user avater URL
 * @apiSuccess {Object} user.blockMessage user avater URL, firebase format, contain seconds and nanoseconds
 * @apiSuccess {Number} user.blockMessage._seconds 
 * @apiSuccess {Number} user.blockMessage._nanoseconds
 * @apiSuccess {Object} [user.defaultTitle] user URL, must choosed from titles field
 * @apiSuccess {String} [user.defaultTitle.league] league nested default title 
 * @apiSuccess {Number} [user.defaultTitle.sport] sport nested default title 
 * @apiSuccess {String} [user.defaultTitle.rank] rank nested default title 
 * @apiSuccess {String} user.displayName user  URL, must be unique
 * @apiSuccess {Number} user.point points earned by user
 * @apiSuccess {Number} user.role user role, -1: locked user, 0: incomplete profile which registered user, 1: normal user, 2: god user, 9: admin
 * @apiSuccess {String} user.signatue user setting signatue
 * @apiSuccess {String[]} [user.titles] titles obtained by user
 * @apiSuccess {String} user.uid user unique id, firebase automated generated
 * 
 * @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
      "createTime": {
          "_seconds": 1576222331,
          "_nanoseconds": 597000000
    },
    "reply": {
        "channelId": "public",
        "message": "test123",
        "type": "text",
        "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "createTime": {
            "_seconds": 1576222183,
            "_nanoseconds": 913000000
        },
        "messageId": "dJZRF8WIdonpOYQnTDDh",
        "softDelete": 2,
        "user": {
            "blockMessage": {
                "_seconds": 1575907200,
                "_nanoseconds": 0
            },
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
            "point": 250,
            "role": 1,
            "displayName": "愛心喵",
            "titles": [
                {
                    "league": "MLB",
                    "sport": 16,
                    "rank": 1
                },
                {
                    "rank": 3,
                    "league": "CPBL",
                    "sport": 16
                }
            ],
            "signature": "下輩子當貓好了",
            "defaultTitle": {
                "league": "MLB",
                "sport": 16,
                "rank": 1
            }
        }
    },
    "message": {
        "channelId": "public",
        "message": "test123",
        "type": "text",
        "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "messageId": "8XufH5Z7dsalpApMPmFZ",
        "softDelete": 2
    },
    "user": {
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "displayName": "愛心喵",
        "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
        "role": 1,
        "point": 250,
        "titles": [
            {
                "rank": 1,
                "league": "MLB",
                "sport": 16
            },
            {
                "rank": 3,
                "league": "CPBL",
                "sport": 16
            }
        ],
        "defaultTitle": {
            "league": "MLB",
            "sport": 16,
            "rank": 1
        },
        "blockMessage": {
            "_seconds": 1575907200,
            "_nanoseconds": 0
        },
        "signature": "下輩子當貓好了"
    }
}
 *
 @apiSuccessExample {JSON} Success-Response
 *  HTTP/1.1 200 OK
 * {
      "createTime": {
          "_seconds": 1576222331,
          "_nanoseconds": 597000000
    },
    "message": {
        "channelId": "public",
        "message": "test123",
        "type": "text",
        "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "messageId": "8XufH5Z7dsalpApMPmFZ",
        "softDelete": 2
    },
    "user": {
        "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
        "displayName": "愛心喵",
        "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
        "role": 1,
        "point": 250,
        "titles": [
            {
                "rank": 1,
                "league": "MLB",
                "sport": 16
            },
            {
                "rank": 3,
                "league": "CPBL",
                "sport": 16
            }
        ],
        "defaultTitle": {
            "league": "MLB",
            "sport": 16,
            "rank": 1
        },
        "blockMessage": {
            "_seconds": 1575907200,
            "_nanoseconds": 0
        },
        "signature": "下輩子當貓好了"
    }
}
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
        "keyword": "enum",
        "dataPath": ".message.channelId",
        "schemaPath": "#/properties/message/properties/channelId/enum",
        "params": {
            "allowedValues": [
                "public"
            ]
        },
        "message": "should be equal to one of the allowed values"
    },
    {
        "keyword": "enum",
        "dataPath": ".message.type",
        "schemaPath": "#/properties/message/properties/type/enum",
        "params": {
            "allowedValues": [
                "text",
                "image/jpeg",
                "image/png",
                "video/mp4",
                "video/quicktime"
            ]
        },
        "message": "should be equal to one of the allowed values"
    }
]
 * 
 * @apiErrorExample {JSON} 400-Response
 * HTTP/1.1 400 Bad Request
 * [
    {
        "keyword": "format",
        "dataPath": ".message.message",
        "schemaPath": "#/properties/message/then/properties/message/format",
        "params": {
            "format": "url"
        },
        "message": "should match format \"url\""
    },
    {
        "keyword": "if",
        "dataPath": ".message",
        "schemaPath": "#/properties/message/if",
        "params": {
            "failingKeyword": "then"
        },
        "message": "should match \"then\" schema"
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
    "error": "user had been muted"
}
 * @apiErrorExample {JSON} 403-Response
 * HTTP/1.1 403 Forbidden
 * {
    "code": 403,
    "error": "can not reply message which deleted by user himself/herself"
}
 * @apiErrorExample {JSON} 404-Response
 * HTTP/1.1 404 Not Found
 * {
    "code": 404,
    "error": "user not found"
}
 * @apiErrorExample {JSON} 404-Response
 * HTTP/1.1 404 Not Found
 * {
    "code": 404,
    "error": "message/file not found"
}
 * @apiErrorExample {JSON} 500-Response
 * HTTP/1.1 500 Internal Server Error
 * {
    "code": 500,
    "error": {}
}
 */
