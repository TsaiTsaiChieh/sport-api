const modules = require('../util/modules');
const NBA_functions = require('./util/prematchFunctions_NBA');
function cron10Min() {
  const date = modules.moment();
  NBA_functions.NBA.lineup(date, modules.db.basketball_NBA);
}
module.exports = cron10Min;
