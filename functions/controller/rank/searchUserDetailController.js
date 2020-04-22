const modules = require('../../util/modules');
const searchUserDetailModel = require('../../model/rank/searchUserDetailModel');

async function searchUserDetail(req, res) {
    try {
        const schema = {
            type: 'object',
            required: ['uid'],
            properties: {
              id: { type: 'string' }
            }
          };

          const args = {};
          req.params.uid ? (args.uid = req.params.uid) : '';
          const valid = modules.ajv.validate(schema, args);
          if (!valid) {
            res.status(400).send(modules.ajv.errors);
            return;
          }
        res.json(await searchUserDetailModel(args.uid));
    } catch (err) {
        res.status(err.code).json(err.err);
    }
}
module.exports = searchUserDetail;
