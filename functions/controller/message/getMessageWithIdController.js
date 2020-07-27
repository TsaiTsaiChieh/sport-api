const ajv = require('../../util/ajvUtil');
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
  args.id = req.params.id ? req.params.id : '';
  const valid = ajv.validate(schema, args);
  if (!valid) {
    res.status(400).send(ajv.errors);
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
