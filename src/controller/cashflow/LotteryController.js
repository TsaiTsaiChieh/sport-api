const LotteryModel = require('../../model/cashflow/LotteryModel');

async function LotteryController(req, res) {
  try {
    res.json(await LotteryModel(req));
  } catch (err) {
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = LotteryController;
