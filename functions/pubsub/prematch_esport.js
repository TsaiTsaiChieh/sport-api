/* eslint-disable consistent-return */
const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
const eSoccer_functions = require('./util/prematchFunctions_ESoccer');

async function prematch_esport() {
  const unix = Math.floor(Date.now() / 1000);
  const tomorrow = modules.convertTimezoneFormat(unix, {
    op: 'add',
    value: 1,
    unit: 'days'
  });
  const now = modules.convertTimezoneFormat(unix);
  try {
    await eSoccer_functions.eSoccer.upcoming(now);
    await eSoccer_functions.eSoccer.upcoming(tomorrow);
  } catch (err) {
    return reject(
      new AppErrors.PrematchEsoccerError(`${err} at prematch_esports by DY`)
    );
  }
}

module.exports = prematch_esport;
