const carrierModel = require('../../model/invoice_ezpay/carrierModel');

async function carrierController(req, res) {
  try {
    res.send(await carrierModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = carrierController;
