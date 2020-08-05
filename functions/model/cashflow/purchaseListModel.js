const db = require('../../util/dbUtil');
async function purchaseListModel(args) {
  return new Promise(async function(resolve, reject) {
    const purchase_list = await db.sequelize.models.cashflow_purchase_list.findAll({
      attributes: [
        'list_id',
        'coin',
        'dividend'
      ],
      where: {
        official_active: 1
      },
      order: [
        ['official_sort', 'ASC']
      ],
      raw: true
    });
    resolve(purchase_list);
  });
}

module.exports = purchaseListModel;
