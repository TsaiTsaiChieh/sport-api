/* eslint-disable consistent-return */
const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
// const NBA_functions = require('./util/prematchFunctions_NBA');
// const SBL_functions = require('./util/prematchFunctions_SBL');
// const MLB_functions = require('./util/prematchFuntions_MLB');
const KBO_functions = require('./util/prematchFunctions_KBO');
// Just for NBA & SBL now
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
    // try {
    //   await NBA_functions.NBA.upcomming(tomorrow);
    //   NBA_functions.NBA.prematch(now);
    // } catch (error) {
    //   console.error(error);
    // }
    // try {
    //   await SBL_functions.SBL.upcomming(tomorrow);
    //   SBL_functions.SBL.prematch(tomorrow);
    // } catch (error) {
    //   console.error(error);
    // }
    // try {
    //   await MLB_functions.MLB_PRE.upcoming(now);
    //   // query now 上午八點過後的場次
    //   await MLB_functions.MLB_PRE.upcoming(tomorrow);
    //   MLB_functions.MLB.prematch(now);
    //   MLB_functions.MLB.teamStat(now);
    // } catch (error) {
    //   console.error(error);
    // }
    try {
      await KBO(now);
      await KBO(tomorrow);
    } catch (err) {
      return reject(new AppErrors.KBOMLBError(`${err} at prematch by DY`));
    }
    return resolve('ok');
  });
}
async function KBO(date) {
  return new Promise(async function(resolve, reject) {
    try {
      await KBO_functions.KBO.upcoming(date);
      return resolve('ok');
    } catch (err) {
      return reject(new AppErrors.KBOMLBError(`${err} at prematch by DY`));
    }
  });
}
module.exports = prematch;
