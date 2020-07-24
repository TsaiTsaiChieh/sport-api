/* eslint-disable consistent-return */
const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
// const NBA_functions = require('./util/prematchFunctions_NBA');
// const SBL_functions = require('./util/prematchFunctions_SBL');
// const MLB_functions = require('./util/prematchFuntions_MLB');
// BASEBALL
const KBO_functions = require('./util/prematchFunctions_KBO');
const NPB_functions = require('./util/prematchFunctions_NPB');
const CPBL_functions = require('./util/prematchFunctions_CPBL');
const MLB_functions = require('./util/prematchFunctions_MLB');
// BASKETBALL
const CBA_functions = require('./util/prematchFunctions_CBA');
// SOCCER
const Soccer_functions = require('./util/prematchFunctions_Soccer');
// upcomming is BetsAPI, prematch is for sportradar
async function prematch() {
  return new Promise(async function(resolve, reject) {
    const unix = Math.floor(Date.now() / 1000);
    const tomorrow = modules.convertTimezoneFormat(unix, {
      op: 'add',
      value: 1,
      unit: 'days'
    });
    const now = modules.convertTimezoneFormat(unix);
    try {
      // BASEBALL
      await KBO_functions.KBO.upcoming(now);
      await KBO_functions.KBO.upcoming(tomorrow);
      await NPB_functions.NPB.upcoming(now);
      await NPB_functions.NPB.upcoming(tomorrow);
      await CPBL_functions.CPBL.upcoming(now);
      await CPBL_functions.CPBL.upcoming(tomorrow);
      await MLB_functions.MLB.upcoming(now);
      await MLB_functions.MLB.upcoming(tomorrow);
      // BASKETBALL
      await CBA_functions.CBA.upcoming(now);
      await CBA_functions.CBA.upcoming(tomorrow);
      // SOCCER
      await Soccer_functions.Soccer.upcoming(now);
      await Soccer_functions.Soccer.upcoming(tomorrow);
    } catch (err) {
      return reject(new AppErrors.PBPKBOError(`${err} at prematch by DY`));
    }
    return resolve('ok');
  });
}

module.exports = prematch;
