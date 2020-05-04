const modules = require('../util/modules');

inserttest();

async function inserttest() {
  const sportID = 1;
  const leagueID = 22614;
  const unix = Math.floor(Date.now() / 1000);
  const now = modules.convertTimezoneFormat(unix);
  const date = now;
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=${sportID}&token=${modules.betsToken}&league_id=${leagueID}&day=${date}`;
  const date1 = Date.now();
  let { data } = await modules.axios(URL);
  const date2 = Date.now();
  ({ data } = await modules.axios(URL));
  const date3 = Date.now();
  ({ data } = await modules.axios(URL));
  const date4 = Date.now();

  console.log(date2 - date1);
  console.log(date3 - date1);
  console.log(date4 - date1);
}
