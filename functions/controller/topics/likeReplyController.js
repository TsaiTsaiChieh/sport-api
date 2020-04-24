/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/topics/likeReplyModel');
async function likeReply(req, res) {
  const schema = {
    type: 'object',
    requied: ['reply_id', 'like'],
    properties: {
      article_id: {
        type: 'integer',
        maximum: 9999999,
        minimum: 0
      },
      like: {
        type: 'boolean'
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

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}

module.exports = likeReply;
