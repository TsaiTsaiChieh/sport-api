/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModel = require('../../model/message/deleteMessageWithId');

function deleteMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['messageId', 'deleteAction'],
    properties: {
      messageId: { type: 'string' },
      deleteAction: { type: 'integer', minimum: -1, maximum: 1 }
    }
  };
  const args = {};
  args.messageId = req.params.id;
  args.deleteAction = req.body.deleteAction; // use ajv module, so don't parse int
  args.token = req.token; // get from verification middleware

  const valid = modules.ajv.validate(schema, args);

  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  messageModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).send(err.error);
    });
  // res.send('ok');
}

module.exports = deleteMessageWithId;
