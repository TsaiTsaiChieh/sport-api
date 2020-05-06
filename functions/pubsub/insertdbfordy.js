const modules = require('../util/modules');
const db = require('../util/dbUtil');
const MatchLeague = db.League;
inserttest();

async function inserttest() {
  const data = {
    league_id: 349,
    radar_id: 2541,
    sport_id: 16,
    name_ch: '韓國職棒',
    ori_league: 349,
    ori_sport_id: 16
  };
  await MatchLeague.upsert(data);
}
