/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/user/reportTopicModel');
async function reportTopic(req, res) {
  const schema = {
    type: 'object',
    required: [/* 'type', */'article_id', 'content'],
    properties: {
      type: {
        type: 'string',
        enum: ['article', 'reply']
      },
      article_id: {
        type: 'integer'
      },
      content: {
        type: 'string'
      }
    }
  };

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

module.exports = reportTopic;
