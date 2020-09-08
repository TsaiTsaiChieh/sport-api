const systemModel = require('../../model/cashflow/systemModel');

async function system(req, res) {
  try {
    res.json(await systemModel(req));
  } catch (err) {
    console.error('[transferController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = system;
