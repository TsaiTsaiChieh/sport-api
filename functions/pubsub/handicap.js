/* eslint-disable no-await-in-loop */
const modules = require('../util/modules');
const URL = 'https://api.betsapi.com/v2/event/odds/summary';
const leagues = [modules.db.basketball_NBA, modules.db.basketball_SBL];
const intervals = [16, 10, 8, 6];
async function handicap() {
  // const { spread_ids, totals_ids } = query_leagues(leagues);
  const querys_NBA = await query_spread(leagues[0]);
  timer(leagues[0], querys_NBA);

  // console.log(spread_ids_SBL);
}

async function query_spread(leagues) {
  const spread_querys = [];
  // const totals_ids = [];
  const eventsRef = modules.firestore.collection(leagues);
  const spreadQuerys = await eventsRef.where('flag.spread', '==', 0).get();
  spreadQuerys.forEach(async function(docs) {
    spread_querys.push(docs.data());
  });
  // const totalsQuerys = await eventsRef.where('flag.totals', '==', 0).get();
  // totalsQuerys.forEach(async function(docs) {
  //   totals_ids.push(docs.data().bets_id);
  // });

  // return await Promise.all([spread_ids, totals_ids]);
  return await Promise.all(spread_querys);
}
function timer(league, eles) {
  for (let i = 0; i < eles.length; i++) {
    const ele = eles[i];
    const beforeHour =
      (ele.scheduled._seconds * 1000 - Date.now()) / (1000 * 60 * 60);
    // console.log(
    //   ele.bets_id,
    //   modules.moment(ele.scheduled._seconds * 1000),
    //   beforeHour
    // );
    if (beforeHour <= 0) {
      getHandicap(league, ele);
      // console.log('real...', beforeHour);
    }
    // if (intervals[1] <= beforeHour && beforeHour <= intervals[0]) {
    //   console.log(
    //     `${i}, ${ele.bets_id}: ${intervals[1]}<=${beforeHour}<=${intervals[0]}`
    //   );
    //   break;
    // }
    // for (let j = 0; j < intervals.length / 2; i++) {
    //   if (intervals[j + 1] <= beforeHour && beforeHour <= intervals[j]) {
    //     console.log(
    //       `${i}: ${intervals[j + 1]}<=${beforeHour}<=${intervals[j]}`
    //     );
    //     break;
    //   }
    // }
  }
}
async function getHandicap(league, ele) {
  try {
    const eventSnapshot = modules.getDoc(league, ele.bets_id);
    const { data } = await modules.axios(
      `${URL}?token=${modules.betsToken}&event_id=${ele.bets_id}`
    );
    console.log(`${URL}?token=${modules.betsToken}&event_id=${ele.bets_id}`);

    // if no data, the data.results will be { }
    if (data.results.Bet365) {
      const odds = data.results.Bet365.odds.start;
      if (odds['18_2']) {
        const spread = {};
        spread.id = odds['18_2'].id;
        spread.handicap = Number.parseFloat(odds['18_2'].handicap);
        spread.add_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
          new Date(Number.parseInt(odds['18_2'].add_time) * 1000)
        );
        spread.insert_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
          new Date()
        );
        eventSnapshot.set(
          { flag: { spread: 1 }, handicap: { spread } },
          { merge: true }
        );
      }

      if (odds['18_3']) {
        const totals = {};
        totals.id = odds['18_3'].id;
        totals.handicap = Number.parseFloat(odds['18_3'].handicap);
        totals.add_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
          new Date(Number.parseInt(odds['18_3'].add_time) * 1000)
        );
        totals.insert_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
          new Date()
        );
        eventSnapshot.set(
          { flag: { totals: 1 }, handicap: { totals } },
          { merge: true }
        );
      }
    }
  } catch (error) {
    console.log(
      'Error in pubsub/handicap getHandicap functions by Tsai-Chieh',
      error
    );
  }

  // console.log(data);
}
module.exports = handicap;
