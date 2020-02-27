const modules = require('../util/modules');
const NBA_api_key = '48v65d232xsk2am8j6yu693v';
const NBA_functions = require('./util/prematchFunctions_NBA');
function cron10Min() {
  const date = modules.moment();
  NBA_functions.NBA.lineup(date, NBA_api_key);
}
module.exports = cron10Min;
