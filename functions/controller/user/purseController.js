// const modules = require('../../util/modules');
const purseModel = require('../../model/user/purseModel');

async function purse(req, res) {
  try {
    res.json(await purseModel(req.body, req.method, req.token.uid));
  } catch (err) {
    console.error('[purseController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = purse;
