/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const setCustomClaimsModel = require('../../model/admin/setCustomClaimsModel');

async function setCustomClaims(req, res) {
  const schema = {
    type: 'object',
    required: ['uid', 'role'],
    properties: {
      uid: {
        type: 'string'
      },
      role: {
        type: 'integer',
        // -1: locked, 0: sinup but not complete profile, 1: normal,
        // 2: god like, 9: admin, 10: developer
        enum: [-1, 0, 1, 2, 9, 10]
      }
    }
  };
  const args = {};
  args.uid = req.body.uid;
  args.role = req.body.role;
  const validate = modules.ajv.validate(schema, args);
  if (!validate) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  args.token = req.token;
  try {
    res.json(await setCustomClaimsModel(args));
  } catch (err) {
    res.status(err.code).json(err);
  }
}

module.exports = setCustomClaims;
