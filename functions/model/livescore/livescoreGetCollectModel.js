const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(
        args.sport,
        args.league,
        args.UID,
        args.time
      );

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league, UID, time) {
  const result = await repackage(sport, league, UID, time);

  return await Promise.all(result);
}
async function repackage(sport, league, UID, time) {
  const leagueName = `pagetest_${league}_member`;
  const eventData = [];

  const query = await modules.firestore
    .collection(leagueName)
    .where('profile.uid', '==', UID)
    .get();

  query.forEach((doc) => {
    eventData.push(doc.data());
  });
  const out = [];

  for (let i = 0; i < Object.keys(eventData[0]).length - 1; i++) {
    if (time === eventData[0][Object.keys(eventData[0])[i]].scheduled) {
      out.push(eventData[0][Object.keys(eventData[0])[i]]);
    }
  }

  return out;
}
module.exports = livescore;
