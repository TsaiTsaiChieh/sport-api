/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const replyModel = require('../../model/topics/createReplyModel');
async function createTopic(req, res) {
  const schema = {
    type: 'object',
    requied: ['aid', 'content'],
    properties: {
      article_id: {
        type: 'number'
      },
      reply_id: {
        type: ['number', 'null']
      },
      content: {
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

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    console.log(modules.ajv.errors);
    res.status(400).send('schema not acceptable');
    return;
  }
  req.body.token = req.token;
  const args = req.body;

  replyModel(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}

module.exports = createTopic;
