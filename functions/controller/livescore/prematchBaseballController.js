const modules = require('../../util/modules');
const model = require('../../model/livescore/prematchBaseballModel');

async function prematchBaseball(req, res) {
  const schema = {
    type: 'object',
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: ['KBO', 'CPBL', 'NPB']
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);

  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/livescore/prematchBaseball by TsaiChieh', err);
    return res
      .status(err.code)
      .json(err.isPublic
        ? { error: err.name, devcode: err.status, message: err.message }
        : err.code);
  }
}

module.exports = prematchBaseball;
