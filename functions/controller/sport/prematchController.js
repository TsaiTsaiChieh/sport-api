const modules = require('../../util/modules');
const model = require('../../model/sport/prematchModel');

async function prematch(req, res) {
  const schema = {
    type: 'object',
    require: ['date', 'league'],
    properties: {
      date: {
        type: 'string',
        format: 'date'
      },
      league: {
        type: 'string',
        enum: ['NBA']
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = prematch;
