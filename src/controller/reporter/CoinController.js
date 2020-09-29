const CoinModel = require('../../model/reporter/CoinModel');

async function Coin(req, res) {
  try {
    res.json(await CoinModel(req));
  } catch (err) {
    console.error('[CoinController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = Coin;
