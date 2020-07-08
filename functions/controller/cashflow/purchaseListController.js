const purchaseListModel = require('../../model/cashflow/purchaseListModel');

async function purchaseListController(req, res) {
  try {
    res.json(await purchaseListModel(req));
  } catch (err) {
    res.status(err.code || 500).json(err.err || { code: 500, msg: '執行異常！' });
  }
}

module.exports = purchaseListController;
