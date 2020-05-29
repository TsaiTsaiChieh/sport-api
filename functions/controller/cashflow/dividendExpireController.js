const dividendExpireModel = require('../../model/cashflow/dividendExpireModel');

async function dividendExpireController(req, res) {
  try {
    res.json(await dividendExpireModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = dividendExpireController;
