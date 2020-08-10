const bankModel = require('../../model/user/bankModel');

async function purse(req, res) {
  try {
    res.json(await bankModel(req.body, req.method, req.token.uid));
  } catch (err) {
    console.error('[bankController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = purse;
