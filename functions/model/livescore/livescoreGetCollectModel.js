const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let result;

      if (args.error) {
        //reject
        result = 'reject';
      } else {
        result = await reResult(args.sport, args.league, args.UID);
      }

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreCollectModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league, UID) {
  let result;
  result = await repackage(sport, league, UID);

  return await Promise.all(result);
}
async function repackage(sport, league, UID) {
  let leagueName = `pagetest_${league}_member`;

  let query = await modules.firestore
    .collection(leagueName)
    .where(`profile.uid`, '==', UID)
    .get();

  let eventData = [];
  query.forEach(doc => {
    eventData.push(doc.data());
  });

  return eventData;
}
module.exports = livescore;