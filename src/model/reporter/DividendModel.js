const errs = require('../../util/errorCode');

function DividendModel(req) {
  return new Promise(async function(resolve, reject) {
    try {
      resolve({});
    } catch (err) {
      console.log('Error in  reporter/dividend by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = DividendModel;
