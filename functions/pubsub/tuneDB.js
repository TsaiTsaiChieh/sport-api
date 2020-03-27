const modules = require('../util/modules');

async function tuneDB() {
  const collection = await modules.firestore.collection('basketball_NBA').get();

  collection.docs.map(async function(doc) {
    await modules.addDataInCollectionWithId(
      'NBA_TC',
      doc.data().bets_id,
      repackageData(doc.data())
    );
  });
}

function repackageData(data) {
  data.flag.prematch = 1;
  if (data.handicap) {
    data.spread = repackageHandicap(data.handicap.spread);
    data.totals = repackageHandicap(data.handicap.totals);
    delete data.handicap;
  }
  return data;
}
function repackageHandicap(handicapObj) {
  for (const key in handicapObj) {
    handicapObj[key].add_time = handicapObj[key].add_time._seconds;
    handicapObj[key].insert_time = handicapObj[key].insert_time._seconds;
  }
  return handicapObj;
}
module.exports = tuneDB;
