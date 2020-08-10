const { acceptLeague } = require('../../config/acceptValues');
const ajv = require('../../util/ajvUtil');
const httpStatus = require('http-status');
const model = require('../../model/history/eventScheduledModel');

async function eventScheduled(req, res) {
  const schema = {
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: acceptLeague
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
    console.error('Error in controller/history/eventScheduled by DY', err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      ); // 再觀察
  }
}

module.exports = eventScheduled;
