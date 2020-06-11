const dividendRefundModel = require('../../model/cashflow/dividendRefundModel');

async function dividendRefundController(req, res) {
  try {
    res.json(await dividendRefundModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = dividendRefundController;
