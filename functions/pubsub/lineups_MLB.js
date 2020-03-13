const modules = require('../util/modules');
const MLB_functions = require('./util/prematchFuntions_MLB');
function lineups_MLB() {
  const date = modules.moment();
  MLB_functions.MLB_PRE.lineups(date);
}
module.exports = lineups_MLB;
