/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/user/favoriteGodModel');
async function favoriteGod(req, res) {
  const schema = {
    type: 'object',
    requied: ['god_uid', 'like'],
    properties: {
      god_uid: {
        type: 'string'
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

module.exports = favoriteGod;
