/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../../util/modules');
const messageModel = require('../../model/message/getMessageWithIdModel');

function getMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  };

  const args = {};
  req.params.id ? (args.id = req.params.id) : '';
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    res.status(400).send(modules.ajv.errors);
    return;
  }

  messageModel(args.id)
    .then(body => {
      res.json(body);
    })
    .catch(err => {
      res.status(err.code).send(err.error);
    });
}
module.exports = getMessageWithId;
