const ajv = require('../../util/ajvUtil');
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
    args.uid = req.params.uid ? req.params.uid : '';
    const valid = ajv.validate(schema, args);
    if (!valid) {
      res.status(400).send(ajv.errors);
      return;
    }
    res.json(await searchUserDetailModel(args.uid));
  } catch (err) {
    console.error('[searchUserDetailController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = searchUserDetail;
