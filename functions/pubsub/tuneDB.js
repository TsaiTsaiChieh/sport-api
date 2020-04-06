const modules = require('../util/modules');

async function tuneDB() {
  const collection = await modules.firestore.collection('basketball_NBA').get();
  collection.docs.map(async function (doc) {
    const match = doc.data();
    newestHandicap(doc.data());
    await modules.addDataInCollectionWithId(
      'basketball_NBA',
      match.bets_id,
      handicapProcessor(match)
    );
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
    newestKey = sortTime(ids, add_time);

    data.spread[newestKey].handicap_id = newestKey;
    modules.addDataInCollectionWithId('basketball_NBA', data.bets_id, {
      newest_spread: data.spread[newestKey],
    });
  }
  if (data.totals) {
    const ids = [];
    const add_time = [];
    for (const key in data.totals) {
      ids.push(key);
      add_time.push(data.totals[key].add_time);
    }
    newestKey = sortTime(ids, add_time);
    data.totals[newestKey].handicap_id = newestKey;
    modules.addDataInCollectionWithId('basketball_NBA', data.bets_id, {
      newest_totals: data.totals[newestKey],
    });
  }
}
function sortTime(ids, add_time) {
  return ids[add_time.indexOf(Math.max(...add_time))];
}
function handicapProcessor(data) {
  if (data.spread) {
    for (const key in data.spread) {
      handicapCalculator(data.spread[key]);
    }
  }
  if (data.newest_spread) {
    handicapCalculator(data.newest_spread);
  }
  return data;
}
function handicapCalculator(handicapObj) {
  // 賠率相同
  if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap < 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    // handicapObj.away_tw = `${Math.floor(handicapObj.handicap)} 輸`;
    handicapObj.away_tw = `${Math.ceil(Math.abs(handicapObj.handicap))}贏`;
  } else if (
    handicapObj.handicap % 1 !== 0 &&
    handicapObj.handicap > 0
    // handicapObj.home_odd === handicapObj.away_odd
  ) {
    // handicapObj.home_tw = `${Math.abs(Math.floor(handicapObj.handicap))}輸`;
    handicapObj.home_tw = `${Math.ceil(handicapObj.handicap)}贏`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap > 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.home_tw = `${handicapObj.handicap}平`;
  } else if (
    handicapObj.handicap % 1 === 0 &&
    handicapObj.handicap < 0 &&
    handicapObj.home_odd === handicapObj.away_odd
  ) {
    handicapObj.away_tw = `${Math.abs(handicapObj.handicap)}平`;
  }

  return handicapObj;
}
// async function tuneDB() {
//   const collection = await modules.firestore.collection('NBA_TC').get();

//   collection.docs.map(async function(doc) {
//     await modules.addDataInCollectionWithId(
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
