/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/user/contactServiceModel');
async function contactService(req, res) {
  const schema = {
    type: 'object',
    requied: ['name', 'email', 'content'],
    properties: {
      uid: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      email: {
        type: 'string',
      },
      content: {
        type: 'string',
      },
      images: {
        type: 'array',
        maxItems: 3,
        items: [
          { type: 'string' },
          { type: 'string' },
          { type: 'string' }
        ],
      },
    }
  }

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  req.body.token = req.token;
  const args = req.body;
  
  model(args)
  .then(function(body) {
    res.json(body);
  })
  .catch(function(err) {
    res.status(err.code).json(err);
  });
}

module.exports = contactService;
