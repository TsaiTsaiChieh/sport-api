const modules = require('../../util/modules');
const ajv = require('../../util/ajvUtil');
const model = require('../../model/history/getSeasonDateModel');

async function getSeasonDate(req, res) {
  const schema = {
    required: ['eventID'],
    properties: {
      eventID: {
        type: 'string'
      }
    }
  };

  const valid = ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(ajv.errors);
  }
  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/history/getSeasonDate by DY', err);
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
