const ingotTransferModel = require('../../model/cashflow/ingotTransferModel');

async function ingotTransferController(req, res) {
  try {
    res.json(await ingotTransferModel(req.body));
  } catch (err) {
    console.error('[ingotTransferController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = ingotTransferController;
