/* eslint-disable consistent-return */
const modules = require('../util/modules');
const NBA_functions = require('./util/prematchFunctions_NBA');
const SBL_functions = require('./util/prematchFunctions_SBL');
const MLB_functions = require('./util/prematchFuntions_MLB');
// Just for NBA & SBL now
// upcomming is BetsAPI, prematch is for sportradar
async function prematch() {
  const tomorrow = modules
    .moment()
    .utcOffset(8)
    .add(1, 'days')
    .format('YYYY-MM-DD');
  const now = modules
    .moment()
    .utcOffset(8)
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');

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
  try {
    await MLB_functions.MLB_PRE.upcoming(now);
    // query now 上午八點過後的場次
    await MLB_functions.MLB_PRE.upcoming(tomorrow);
    MLB_functions.MLB.prematch(now);
    MLB_functions.MLB.teamStat();
  } catch (error) {
    console.error(error);
  }
}

module.exports = prematch;
