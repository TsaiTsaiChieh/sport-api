const ingotTransferModel = require('../../model/cashflow/ingotTransferModel');

async function ingotTransferController(req, res) {
  try {
    res.json(await ingotTransferModel(req.body));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = ingotTransferController;
