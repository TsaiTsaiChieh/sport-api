const ajv = require('../../util/ajvUtil');
const model = require('../../model/user/contactServiceModel');
async function contactService(req, res) {
  const schema = {
    type: 'object',
    required: ['name', 'email', 'content'],
    properties: {
      name: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      content: {
        type: 'string'
      },
      images: {
        type: 'array',
        maxItems: 12,
        items: { type: 'string' }
      }
    }
  };

  const valid = ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(ajv.errors);
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
