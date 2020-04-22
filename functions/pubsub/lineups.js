const modules = require('../util/modules');
const NBA_functions = require('./util/prematchFunctions_NBA');
function lineups () {
  const date = modules.moment();
  NBA_functions.NBA.lineup(date);
}
module.exports = lineups;
