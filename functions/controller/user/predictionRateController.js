const modules = require('../../util/modules');
const model = require('../../model/user/predictionRateModel');

async function predictionRate(req, res) {
  const schema = {
    type: 'object',
    required: ['league', 'date', 'user_type'],
    properties: {
      league: {
        type: 'string',
        enum: ['NBA']
      },
      date: {
        type: 'string',
        format: 'date'
      },
      user_type: {
        type: 'string',
        enum: ['all', 'god']
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
    console.error(
      'Error in controller/user/predictRateController function by TsaiChieh',
      err
    );
    res
      .status(err.code)
      .json(
        err.isPublic
          ? { error: err.name, devcode: err.status, message: err.message }
          : err.code
      );
  }
}

module.exports = predictionRate;
