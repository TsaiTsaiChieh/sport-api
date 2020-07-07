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
    return acceptLeague;
  } catch (err) {
    console.error(`${err.stack} by DY`);
    throw new AppErrors.RepackageError(`${err.stack} by DY`);
  }
}
module.exports = acceptLeague;
