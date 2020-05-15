/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const model = require('../../model/topics/donateModel');
async function donate(req, res) {
  const schema = {
    type: 'object',
    required: ['article_id', 'type', 'cost'],
    properties: {
      article_id: {
        type: 'integer',
        maximum: 9999999,
        minimum: 0
      },
      type: {
        type: 'string',
        enum: ['coin', 'dividend'] // 搞幣 紅利
      },
      cost: {
        type: 'integer',
        maximum: 99999,
        minimum: 1
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    console.log(modules.ajv.errors);
    const ajv_errs = [];
    for (let i = 0; i < modules.ajv.errors.length; i++) {
      ajv_errs.push('path: \'' + modules.ajv.errors[i].dataPath + '\': ' + modules.ajv.errors[i].message);
    }
    res.status(400).json({ code: 400, error: 'schema not acceptable', message: ajv_errs });
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

module.exports = donate;
