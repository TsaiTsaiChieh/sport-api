/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModel = require('../../model/message/deleteMessageWithId');

function deleteMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['id', 'deleteAction'],
    properties: {
      id: { type: 'string' },
      deleteAction: { type: 'integer', minimum: -1, maximum: 1 }
    }
  };
  const args = {};
  req.params.id ? (args.id = req.params.id) : '';
  req.body.deleteAction || req.body.deleteAction === 0
    ? (args.deleteAction = Number.parseFloat(req.body.deleteAction))
    : '';
  args.token = req.token; // get from verification middleware

  const valid = modules.ajv.validate(schema, args);

  if (!valid) {
    res.status(400).send(modules.ajv.errors);
    return;
  }
  messageModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).send(err.error);
    });
}

module.exports = deleteMessageWithId;
