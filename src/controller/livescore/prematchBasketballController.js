const { acceptNumberAndLetter } = require('../../config/acceptValues');
const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
const model = require('../../model/livescore/prematchBasketballModel');

async function prematchBasketball(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'event_id'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA', 'SBL', 'WNBA', 'NBL', 'KBL', 'CBA', 'BJL']
      },
      event_id: {
        type: 'string',
        pattern: acceptNumberAndLetter
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);

  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/livescore/prematchBasketball by DY', err);
    return res
      .status(err.code)
      .json(err.isPublic
        ? { error: err.name, devcode: err.status, message: err.message }
        : err.code);
  }
}

module.exports = prematchBasketball;
