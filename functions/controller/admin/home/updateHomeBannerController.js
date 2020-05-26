/* eslint-disable promise/always-return */
const modules = require('../../../util/modules');
const model = require('../../../model/admin/home/updateHomeBannerModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      id: {
        type: 'number'
      },
      title: {
        type: 'string'
      },
      content: {
        type: 'string'
      }
    },
    required: ['id', 'title', 'content']
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
  // req.body.token = req.token;
  const args = req.body;

  model(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).json(err);
    });
}
module.exports = controller;
