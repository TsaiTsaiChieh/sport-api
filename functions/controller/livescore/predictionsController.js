const modules = require('../../util/modules');
const model = require('../../model/livescore/predictionsModel');

async function predictions(req, res) {
  const schema = {
    type: 'object',
    required: ['league'],
    properties: {
      league: {
        type: 'string',
        enum: modules.acceptLeague
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);

  // append required parameter to model
  const args = {
    uid: req.token.uid,
    league: req.query.league
  };

  try {
    res.json(await model(args));
  } catch (err) {
    console.error('Error in controller/livescore/predictions by TsaiChieh', err);
    res.status(err.code)
      .json(err.isPublic
        ? { error: err.name, devcode: err.status, message: err.message }
        : err.code);
  }
}

module.exports = predictions;
