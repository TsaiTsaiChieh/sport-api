const db = require('../../../util/dbUtil');
async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.sequelize.query(`UPDATE cashflow_ingot_transfers SET cash_status = ${args.result} WHERE transfer_id = ${args.transfer_id}`);

      resolve({ code: 200 });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
