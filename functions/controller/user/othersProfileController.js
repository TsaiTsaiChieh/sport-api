const modules = require('../../util/modules');
const model = require('../../model/user/othersProfileModel');

async function othersProfile(req, res) {
  const schema = {
    required: ['uid'],
    type: 'object',
    properties: {
      uid: {
        type: 'string',
        format: modules.acceptNumberAndLetter
      }
    }
  };

  const valid = modules.ajv.validate(schema, req.query);
  if (!valid) return res.status(modules.httpStatus.BAD_REQUEST).json(modules.ajv.errors);

  try {
    res.json(await model(req.query));
  } catch (err) {
    console.error('Error in controller/user/otherProfile by TsaiChieh', err);
    res.status(err.code).json(err.isPublic ? { error: err.err.name, devcode: err.status, message: err.message } : err.code);
  }
}

module.exports = othersProfile;
