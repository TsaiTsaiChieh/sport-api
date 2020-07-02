const dividendExpireModel = require('../../model/cashflow/dividendExpireModel');

async function dividendExpireController(req, res) {
  try {
    res.json(await dividendExpireModel(req));
  } catch (err) {
    console.error('[dividendExpireController]', err);
    res.status(err.code).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = dividendExpireController;
