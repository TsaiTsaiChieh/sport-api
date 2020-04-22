/* eslint-disable consistent-return */
const modules = require('../util/modules');

// const eBKA_functions = require('./util/prematchFunction_eBKA');
const eSB8_functions = require('./util/prematchFunction_eSB8');

async function prematch_esport () {
  const unix = Math.floor(Date.now() / 1000);
  const tomorrow = modules.convertTimezoneFormat(unix, {
    op: 'add',
    value: 1,
    unit: 'days'
  });
  const now = modules.convertTimezoneFormat(unix);
  try {
    await eSB8_functions.eSB8.upcoming(now);
  } catch (err) {
    console.error(err);
  }
}

module.exports = prematch_esport;
