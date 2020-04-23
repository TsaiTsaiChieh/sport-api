const modules = require('../../util/modules');
const model = require('../../model/user/predictionRateModel');

async function predictionRate(req, res) {
  const schema = {
    type: 'object',
    required: ['match_id', 'handicap_type'],
    properties: {
      match_id: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter
      },
      handicap_type: {
        type: 'string',
        enum: ['1', '2']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }

  try {
    res.json(await model(req.query));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = predictionRate;
