const modules = require('../../util/modules');
const model = require('../../model/user/predictionResultsModel');

async function predictionResult(req, res) {
  const schema = {
    type: 'object',
    required: ['date'],
    properties: {
      date: {
        type: 'string',
        format: 'date',
        // TODO 未來可能不會給 default 值
        default: '2020-07-01'
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) {
    return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  }
  const args = {
    token: req.token,
    date: req.query.date
  };
  try {
    res.json(await model(args));
  } catch (err) {
    console.error(err);
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = predictionResult;
