const purchaseListModel = require('../../model/cashflow/purchaseListModel');

async function purchaseListController(req, res) {
  try {
    res.json(await purchaseListModel(req));
  } catch (err) {
    res.status(err.code).json(err.err);
  }
}

module.exports = purchaseListController;
