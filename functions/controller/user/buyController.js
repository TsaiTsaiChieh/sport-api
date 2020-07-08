// const modules = require('../../util/modules');
const buyModel = require('../../model/user/buyModel');

async function buy(req, res) {
  try {
    req.args = req.body;
    res.json(await buyModel(req.args, req.token.uid));
  } catch (err) {
    console.error('[buyController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = buy;
