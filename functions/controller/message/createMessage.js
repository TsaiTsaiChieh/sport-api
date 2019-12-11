/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModel = require('../../model/message/createMessage');
function createMessage(req, res) {
  // console.log(req.body,req.token);
  const schema = {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'object',
        required: ['channelId', 'message', 'type', 'hash'],
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
            enum: ['string', 'file'] // message type
          },
          hash: {
            hash: 'string'
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
