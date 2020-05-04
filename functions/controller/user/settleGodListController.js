const modules = require('../../util/modules');
const settleGodListModel = require('../../model/user/settleGodListModel');

async function settleGodList(req, res) {
//   const schema = {
//     type: 'object',
//     required: ['bets_id'],
//     properties: {
//       bets_id: {
//         type: 'integer',
//         minimum: 0, // 避免有負值
//         maximum: 9999999999 // 限制在十位數內
//       }
//     }
//   };

  //   const valid = modules.ajv.validate(schema, req.body);
  //   if (!valid) {
  //     return res.status(400).json(modules.ajv.errors);
  //   }

  try {
    req.body.token = req.token;

    res.json(await settleGodListModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = settleGodList;
