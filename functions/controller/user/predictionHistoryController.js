const modules = require('../../util/modules');
const model = require('../../model/user/predictionHistoryModel');

async function predictionHistory(req, res) {
  const now = new Date();
  const schema = {
    type: 'object',
    required: ['uid'],
    properties: {
      uid: {
        type: 'string',
        pattern: modules.acceptNumberAndLetter,
        default: req.token ? req.token.uid : req.query.uid
      }
    }
  };
  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);
  console.log(schema.properties.uid.default);

  const args = {
    now,
    uid: schema.properties.uid.default
  };

  try {
    return res.json(await model(args));
  } catch (err) {
    console.error(err);
    res.status(err.code).json(err.isPublic ? { error: err.name, devcode: err.status, message: err.message } : err.code);
  }
}

module.exports = predictionHistory;
