const modules = require('../../util/modules');
const model = require('../../model/history/seasonRecordModel');

async function getSeasonDate(req, res) {
  const schema = {
    required: ['league', 'event_id'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      },
      event_id: {
        type: 'string'
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
    console.error('Error in controller/history/seasonRecord by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = getSeasonDate;
