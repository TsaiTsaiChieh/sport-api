const mpgNotifyModel = require('../../model/cashflow_neweb/mpgNotifyModel');

async function mpgNotifyController(req, res) {
  try {
    res.send(await mpgNotifyModel(req));
  } catch (err) {
    console.error('[mpgNotifyController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = mpgNotifyController;
