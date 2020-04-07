const modules = require('../../util/modules');

function postCollect(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let result = await reResult(
        args.sport,
        args.league,
        args.UID,
        args.eventID
      );

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescorePostCollectModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league, UID, eventID) {
  let result;
  result = await repackage(sport, league, UID, eventID);

  return await Promise.all(result);
}
async function repackage(sport, league, UID, eventID) {
  let leagueName = `pagetest_${league}_member`;
  let output = [];
  let validation = await modules.firestore
    .collection(leagueName)
    .doc(`${UID}`)
    .get();

  if (validation.exists) {
    let query = await modules.firestore
      .collection(leagueName)
      .doc(`${UID}`)
      .set(
        { [`${eventID}`]: { eventID: eventID, sport: sport, league: league } },
        { merge: true }
      );
    output.push(
      UID + ' / ' + sport + ' / ' + league + ' / ' + eventID + ' has collected'
    );
  }

  return output;
}
module.exports = postCollect;
