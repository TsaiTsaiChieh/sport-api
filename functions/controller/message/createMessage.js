/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModel = require('../../model/message/createMessage');

/**
 * @api {post} /messages Send or reply a message/file
 * @apiVersion 1.0.0
 * @apiName createMessge
 * @apiGroup messages
 * @apiPermission login user with completed data
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 * @apiParam  {Object} message message object
 * @apiParam  {Object} [reply] Optional reply message id
 *
 *
 * @apiParamExample {json} Request-Example:
 * {
 *    "message": {
 *		    "channelId": "public",
 *		    "message": "test123",
 *		    "type": "text",
 *		    "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53"
 *     }
 *     ,
 *     "reply": {
 *	      "messageId": "dPqN20XQnbWNRLNr5Ohe"
 *      }
 * }
 * @apiSuccess {Boolean} success verify result success
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "true"
 *     }
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Token Missing
 *     {
 *       "success": "false"
 *     }
 */
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
            enum: ['text', 'image/jpeg', 'image/png', 'video/mp4'] // message type
          },
          tempHash: {
            type: 'string'
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
          // uid: {
          //   type: 'string'
          // }
        }
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    console.log(modules.ajv.errors); //
    res.status(400).send(modules.ajv.errors);
    return;
  }
  req.body.token = req.token;
  messageModel(req.body)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      // console.log('錯誤發生在 controller... ', err.error);
      res.status(err.code).send(err.error);
    });
}

module.exports = createMessage;
