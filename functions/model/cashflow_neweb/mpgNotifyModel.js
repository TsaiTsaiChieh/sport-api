const db = require('../../util/dbUtil');

async function mpgNotifyModel(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const notify = await db.sequelize.query(
        `
          UPDATE cashflow_deposits SET status=1 WHERE serial_number=?
        `,
        {
          replacements: 
          {
            serial_number:'serial_number_test'
          },
          type: db.sequelize.QueryTypes.UPDATE
        });
      resolve(notify);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = mpgNotifyModel;
