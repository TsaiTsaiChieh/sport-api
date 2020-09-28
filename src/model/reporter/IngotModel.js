const errs = require('../../util/errorCode');

function IngotModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      resolve({ status: 'success' });
    } catch (err) {
      console.log('Error in  reporter/ingot by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = IngotModel;
