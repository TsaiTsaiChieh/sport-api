const DividendModel = require('../../model/reporter/DividendModel');

async function Dividend(req, res) {
  try {
    res.json(await DividendModel(req));
  } catch (err) {
    console.error('[DividendController]', err);
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}
module.exports = Dividend;
