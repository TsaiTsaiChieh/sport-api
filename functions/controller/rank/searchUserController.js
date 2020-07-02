const modules = require('../../util/modules');
const searchUserModel = require('../../model/rank/searchUserModel');

async function searchUser(req, res) {
  try {
    const schema = {
      type: 'object',
      required: ['display_name'],
      properties: {
        id: { type: 'string' }
      }
    };

    const args = {};
    args.display_name = req.params.display_name ? req.params.display_name : '';
    const valid = modules.ajv.validate(schema, args);
    if (!valid) {
      res.status(400).send(modules.ajv.errors);
      return;
    }
    res.json(await searchUserModel(args.display_name));
  } catch (err) {
    console.error('[searchUserController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = searchUser;
