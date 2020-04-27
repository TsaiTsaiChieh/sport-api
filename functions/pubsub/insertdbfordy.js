const modules = require('../util/modules');

const db = require('../util/dbUtil');

async function inserttest() {
  try {
    const query = await modules.firestore
      .collection('pagetest_NBA')
      .orderBy('scheduled', 'desc')
      .get();
    const eventData = [];
    query.forEach((doc) => {
      eventData.push(doc.data());
    });

    for (let i = 0; i < eventData.length; i++) {
      const ref = await modules.firestore
        .collection('pagetest_NBA')
        .doc(eventData[i].bets_id);
      // if (eventData[i].newest_spreads) {
      //   const name = Object.keys(eventData[i].newest_spreads);
      //   eventData[i].newest_spread = eventData[i].newest_spreads;
      // }
      // if (eventData[i].newest_totals) {
      //   const name = Object.keys(eventData[i].newest_totals);
      //   eventData[i].newest_total = eventData[i].newest_totals;
      // }
      // if (eventData[i].spread) {
      //   eventData[i].spreads = eventData[i].spread;
      // }
      // if (eventData[i].total) {
      //   eventData[i].totals = eventData[i].totals;
      // }
      if (eventData[i].newest_spread) {
        if (eventData[i].newest_spread.away_tw) {
          eventData[i].newest_spread.home_tw = null;
        }
        if (eventData[i].newest_spread.home_tw) {
          eventData[i].newest_spread.away_tw = null;
        }
      }
      // ref.set(eventData[i]);
    }
  } catch (err) {
    console.error(err);
  }
  console.log('ok');
}
function spreadCalculator(handicapObj) {
  // 賠率相同
  if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap < 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
    handicapObj.home_tw = null;
    // handicapObj.away_tw = `${Math.ceil(Math.abs(handicapObj.handicap))}贏`;
  } else if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap >= 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
    handicapObj.away_tw = null;
    // handicapObj.home_tw = `${Math.ceil(handicapObj.handicap)}贏`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${handicapObj.handicap}平`;
    handicapObj.away_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
    handicapObj.home_tw = null;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      // handicapObj.home_tw = `-${handicapObj.handicap} +50`;
      handicapObj.away_tw = `+${handicapObj.handicap} -50`;
      handicapObj.home_tw = null;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.away_tw = `+${handicapObj.handicap} +50`;
      handicapObj.home_tw = null;
      // handicapObj.home_tw = `-${handicapObj.handicap} -50`;
    }
    // console.log(handicapObj, id);
  } else if (
    // 盤口為負，代表客讓主，所以客要減
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    if (handicapObj.home_odd > handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} +50`;
      handicapObj.away_tw = null;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} -50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} -50`;
      handicapObj.away_tw = null;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} +50`;
    }
  }
  return handicapObj;
}
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
