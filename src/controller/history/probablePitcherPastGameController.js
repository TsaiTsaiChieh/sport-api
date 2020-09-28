// const { acceptLeague } = require('../../config/acceptValues');
const httpStatus = require('http-status');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/history/probablePitcherPastGameModel');

async function probablePitcherPastGame(req, res) {
  const schema = {
    required: ['league', 'event_id'],
    properties: {
      league: {
        type: 'string',
        enum: ['KBO', 'CPBL', 'NPB', 'MLB', 'ABL', 'LMB']
      },
      event_id: {
        type: 'string'
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(httpStatus.BAD_REQUEST).json(ajv.errors);
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/history/probablePitcherPastGame by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = probablePitcherPastGame;
