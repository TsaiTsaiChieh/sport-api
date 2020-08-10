const mpgModel = require('../../model/invoice_ezpay/mpgModel');

async function mpgController(req, res) {
  try {
    res.send(await mpgModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = mpgController;
