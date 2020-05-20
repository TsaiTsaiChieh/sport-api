const modules = require('../../util/modules');
const model = require('../../model/user/purchasePredictionsModel');

async function purchasePredictions(req, res) {
  const schema = {
    type: 'object',
    required: ['god_uid', 'god_title', 'matches_date', 'discount'],
    properties: {
      god_uid: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter
      },
      god_title: {
        type: 'string',
        enum: modules.acceptLeague
      },
      matches_date: {
        type: 'string',
        format: 'date'
      },
      discount: {
        type: 'boolean'
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  console.log(valid);

  try {
    res.json(await model(req.body));
  } catch (err) {
    console.error(
      'Error in controller/user/purchasePredictions by TsaiChieh',
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

module.exports = purchasePredictions;
