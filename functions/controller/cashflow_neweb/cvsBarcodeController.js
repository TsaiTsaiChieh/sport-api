const cvsBarcodeModel = require('../../model/cashflow_neweb/cvsBarcodeModel');

async function cvsBarcodeController(req, res) {
  try {
    res.json(await cvsBarcodeModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = cvsBarcodeController;
