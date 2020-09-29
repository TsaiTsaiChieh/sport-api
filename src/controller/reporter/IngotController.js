const IngotModel = require('../../model/reporter/IngotModel');

async function Ingot(req, res) {
  try {
    res.json(await IngotModel(req));
  } catch (err) {
    console.error('[IngotController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = Ingot;
