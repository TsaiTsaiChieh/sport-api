const firebaseAdmin = require('../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const collectionName = 'NBA_TC';
async function tuneDB() {
  const collection = await firestore.collection(collectionName).get();
  collection.docs.map(async function(doc) {
    const match = doc.data();
    newestHandicap(match);
    handicapProcessor(match);

    // handicapProcessor(match).spread;
  });
}

function newestHandicap(data) {
  if (data.spread) {
    const ids = [];
    const add_time = [];
    for (const key in data.spread) {
      ids.push(key);
      add_time.push(data.spread[key].add_time);
    }
    const newestKey = sortTime(ids, add_time);

    data.spread[newestKey].handicap_id = newestKey;
    firestore.collection('basketball_NBA').doc(data.bets_id)
      .set({
        newest_spread: data.spread[newestKey]
      }, { merge: true }).then();
  }
  if (data.totals) {
    const ids = [];
    const add_time = [];
    for (const key in data.totals) {
      ids.push(key);
      add_time.push(data.totals[key].add_time);
    }
    const newestKey = sortTime(ids, add_time);
    data.totals[newestKey].handicap_id = newestKey;
    firestore.collection('basketball_NBA').doc(data.bets_id)
      .set({
        newest_totals: data.totals[newestKey]
      }, { merge: true }).then();
  }
}
function sortTime(ids, add_time) {
  return ids[add_time.indexOf(Math.max(...add_time))];
}
async function handicapProcessor(data) {
  if (data.spread) {
    for (const key in data.spread) {
      spreadCalculator(data.spread[key], data.bets_id);
    }
  }
  if (data.newest_spread) {
    spreadCalculator(data.newest_spread, data.bets_id);
  }
  if (data.totals) {
    for (const key in data.totals) {
      totalsCalculator(data.totals[key], data.bets_id);
    }
  }
  if (data.newest_totals) {
    totalsCalculator(data.newest_totals, data.bets_id);
  }
  await firestore.collection('basketball_NBA').doc(data.bets_id).set(data, { merge: true });
  // return data;
}

function totalsCalculator(handicapObj, id) {
  if (
    handicapObj.over_odd === handicapObj.under_odd ||
    handicapObj.handicap % 1 !== 0
  ) {
    handicapObj.away_tw = `${handicapObj.handicap}`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.over_odd !== handicapObj.under_odd
  ) {
    if (handicapObj.over_odd > handicapObj.under_odd) {
      handicapObj.away_tw = `${handicapObj.handicap} +50`;
    } else if (handicapObj.over_odd < handicapObj.under_odd) {
      handicapObj.away_tw = `${handicapObj.handicap} -50`;
    }
  }
}
function spreadCalculator(handicapObj, id) {
  // 賠率相同
  if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap < 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.away_tw = `${Math.abs(Math.ceil(handicapObj.handicap))}輸`;
    // handicapObj.away_tw = `${Math.ceil(Math.abs(handicapObj.handicap))}贏`;
  } else if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap >= 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${Math.floor(handicapObj.handicap)}輸`;
    // handicapObj.home_tw = `${Math.ceil(handicapObj.handicap)}贏`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${handicapObj.handicap}平`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap >= 0 &&
    handicapObj.home_odd !== handicapObj.away_odd
  ) {
    // 盤口為正，代表主讓客，所以主要減
    if (handicapObj.home_odd > handicapObj.away_odd) {
      // handicapObj.home_tw = `-${handicapObj.handicap} +50`;
      handicapObj.away_tw = `+${handicapObj.handicap} -50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.away_tw = `+${handicapObj.handicap} +50`;
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
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} -50`;
    } else if (handicapObj.home_odd < handicapObj.away_odd) {
      handicapObj.home_tw = `+${Math.abs(handicapObj.handicap)} -50`;
      // handicapObj.away_tw = `-${Math.abs(handicapObj.handicap)} +50`;
    }
  }

  return handicapObj;
}
// async function tuneDB() {
//   const collection = await firestore.collection('NBA_TC').get();

//   collection.docs.map(async function(doc) {
//     await addDataInCollectionWithId(
//       'NBA_TC',
//       doc.data().bets_id,
//       repackageData(doc.data())
//     );
//   });
// }

// function repackageData(data) {
//   data.flag.prematch = 1;
//   if (data.handicap) {
//     data.spread = repackageHandicap(data.handicap.spread);
//     data.totals = repackageHandicap(data.handicap.totals);
//     delete data.handicap;
//   }
//   return data;
// }
// function repackageHandicap(handicapObj) {
//   for (const key in handicapObj) {
//     handicapObj[key].add_time = handicapObj[key].add_time._seconds;
//     handicapObj[key].insert_time = handicapObj[key].insert_time._seconds;
//   }
//   return handicapObj;
// }
module.exports = tuneDB;
