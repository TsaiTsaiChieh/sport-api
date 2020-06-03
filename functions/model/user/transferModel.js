const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');
const modules = require('../../util/modules');
function transferModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      const begin = modules.convertTimezone(args.begin);
      const end = modules.convertTimezone(args.end);
      const deposit = db.sequelize.models.cashflow_deposit.findAll({
        attributes: [
          'uid','coin','dividend','scheduled'
        ],
        raw: true
      });
      resolve(deposit);
    } catch (err) {
      console.log('Error in user/tranfer by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = transferModel;
