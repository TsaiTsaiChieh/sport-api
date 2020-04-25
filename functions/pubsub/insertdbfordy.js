const modules = require('../util/modules');

const db = require('../util/dbUtil');
async function inserttest() {
  try {
    const Match = await db.match_eSoccer.sync();
    // try {
    //   const data = {
    //     bets_id: 1,
    //     league_id: '22000',
    //     ori_league_id: ele.league.id,
    //     sport_id: ele.sport_id,
    //     ori_sport_id: ele.sport_id,
    //     home_id: ele.home.id,
    //     away_id: ele.away.id,
    //     scheduled: Number.parseInt(ele.time),
    //     scheduled_tw: Number.parseInt(ele.time) * 1000,
    //     flag_prematch: 1,
    //     status: 2
    //   };

    //   Match.upsert(data);
    // } catch (err) {
    //   console.error(err);
    // }
  } catch (err) {
    console.error(err);
  }
  console.log('ok');
}
inserttest();
// const realtimeData = JSON.parse(
//   JSON.stringify(
//     // eslint-disable-next-line no-await-in-loop
//     await modules.database.ref('basketball/NBA/20200501').once('value')
//   )
// );

// let ref = modules.database.ref(`basketball/NBA/2118058`);
// await ref.set(realtimeData);
// ref = modules.database.ref(`basketball/NBA/2120646`);
// await ref.set(realtimeData);
// ref = modules.database.ref(`basketball/NBA/2120647`);
// await ref.set(realtimeData);
// ref = modules.database.ref(`basketball/NBA/2121183`);
// await ref.set(realtimeData);
