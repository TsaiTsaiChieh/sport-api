const modules = require('../util/modules');
const db = require('../util/dbUtil');
const MatchLeague = db.League;
const MatchTeam = db.Team;
inserttest();

async function inserttest() {
  const unix = Math.floor(Date.now() / 1000);
  const now = modules.convertTimezoneFormat(unix);
  console.log(now);
}
