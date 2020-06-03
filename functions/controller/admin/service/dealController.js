/* eslint-disable promise/always-return */
const modules = require('../../../util/modules');
const model = require('../../../model/admin/service/dealModel');
async function controller(req, res) {
  const schema = {
    type: 'object',
    properties: {
      article_id: {
        type: 'integer'
      },
      report_id: {
        type: 'integer'
      },
      type: {
        type: 'string',
        enum: ['article', 'reply']
      },
      status: { // 處理狀態
        type: 'string',
        enum: ['1', '2', '3', '9']
      },
      article_status: { // 文章狀態
        type: 'string',
        enum: ['1', '2', '3', '-1', '-2']
      },
      reply: {
        type: ['string', 'null']
      },
      blobkuser: {
        type: 'boolean'
      }
    },
    required: ['article_id', 'type', 'status']
  };
  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    // console.log(modules.ajv.errors);
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
