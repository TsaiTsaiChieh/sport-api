const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
async function purchaseListModel(args) {
  return new Promise(async function(resolve, reject) {
    const purchase_list = await db.sequelize.models.cashflow_purchase_list.findAll({
        attributes: [
          'list_id',
          'coin',
          'dividend'
        ],
        raw: true
      });
    resolve(purchase_list);
  });
}

module.exports = purchaseListModel;
