const mpgModel = require('../../model/cashflow_api/mpgModel');

async function mpgController(req, res) {
  try {
    res.send(await mpgModel(req));
  } catch (err) {
    console.error('[mpgController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = mpgController;
