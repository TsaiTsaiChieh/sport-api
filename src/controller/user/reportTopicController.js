const ajv = require('../../util/ajvUtil');
const model = require('../../model/user/reportTopicModel');
async function reportTopic(req, res) {
  const schema = {
    type: 'object',
    required: ['type', 'article_id', 'reason'],
    properties: {
      type: {
        type: 'string',
        enum: ['article', 'reply']
      },
      article_id: {
        type: 'integer'
      },
      content: {
        type: ['string', 'null']
      },
      reason: {
        type: 'string'
      },
      images: {
        type: 'array',
        maxItems: 3,
        items: [
          { type: 'object' },
          { type: 'object' },
          { type: 'object' }
        ]
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

module.exports = reportTopic;
