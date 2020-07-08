// const modules = require('../../util/modules');
const transferModel = require('../../model/user/transferModel');

async function transfer(req, res) {
  try {
    res.json(await transferModel(req.method, req.body, req.token.uid));
  } catch (err) {
    console.error('[transferController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = transfer;
