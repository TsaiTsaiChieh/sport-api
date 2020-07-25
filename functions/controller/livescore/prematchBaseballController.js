const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/livescore/prematchBaseballModel');

async function prematchBaseball(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'event_id'],
    properties: {
      league: {
        type: 'string',
        enum: ['KBO', 'CPBL', 'NPB']
      },
      event_id: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);

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
