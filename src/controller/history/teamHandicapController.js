const { acceptLeague } = require('../../config/acceptValues');
const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
const model = require('../../model/history/teamHandicapModel');

async function historyTeamHandicap(req, res) {
  const schema = {
    required: ['league', 'team_id'],
    properties: {
      league: {
        type: 'string',
        enum: acceptLeague
      },
      team_id: {
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
    console.error('Error in controller/history/historyTeamHandicap by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = historyTeamHandicap;
