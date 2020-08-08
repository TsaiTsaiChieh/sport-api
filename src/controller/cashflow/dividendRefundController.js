const dividendRefundModel = require('../../model/cashflow/dividendRefundModel');

async function dividendRefundController(req, res) {
  try {
    res.json(await dividendRefundModel(req));
  } catch (err) {
    console.error('[dividendRefundController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = dividendRefundController;
