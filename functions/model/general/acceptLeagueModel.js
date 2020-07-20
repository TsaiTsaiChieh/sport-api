const modules = require('../../util/modules');
const AppErrors = require('../../util/AppErrors');

async function acceptLeague() {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await repackage(modules.acceptLeague);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

async function repackage(acceptLeague) {
  try {
    const result = [];
    for (let i = 0; i < acceptLeague.length; i++) {
      const leagueFlag = await queryTodayEvent(acceptLeague[i]);
      if (leagueFlag === 1) {
        result.push(acceptLeague[i]);
      }
    }

    return acceptLeague;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}

async function queryTodayEvent() {

}
module.exports = acceptLeague;
