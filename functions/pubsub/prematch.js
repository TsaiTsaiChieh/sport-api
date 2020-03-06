/* eslint-disable consistent-return */
const modules = require('../util/modules');
const NBA_functions = require('./util/prematchFunctions_NBA');
const SBL_functions = require('./util/prematchFunctions_SBL');
// Just for NBA & SBL now
// upcomming is BetsAPI, prematch is for sportradar
async function prematch() {
  const date = modules
    .moment()
    .utcOffset(8)
    .add(1, 'days')
    .format('YYYY-MM-DD');
  const yesterday = modules
    .moment()
    .utcOffset(8)
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  // const yesterday = '2020-02-21';
  // const date = '2020-02-22';
  // NBA
  try {
    await NBA_functions.NBA.upcomming(date);
    NBA_functions.NBA.prematch(yesterday);
  } catch (error) {
    console.error(error);
  }
  // SBL
  // const test_date = '2020-03-07';
  try {
    await SBL_functions.SBL.upcomming(date);
    SBL_functions.SBL.prematch(date);
  } catch (error) {
    console.error(error);
  }
}

module.exports = prematch;
