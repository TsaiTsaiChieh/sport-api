const modules = require('../../util/modules');

function postCollect(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(
        args.sport,
        args.league,
        args.UID,
        args.eventID,
        args.time
      );

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescorePostCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league, UID, eventID, time) {
  const result = await repackage(sport, league, UID, eventID, time);

  return await Promise.all(result);
}
async function repackage(sport, league, UID, eventID, time) {
  let leagueName;

  if (league === 'eSoccer') {
    leagueName = `pagetest_${league}_member`;
  } else {
    leagueName = `${sport}_${league}_member`;
  }
  const output = [];
  const validation = await modules.firestore
    .collection(leagueName)
    .doc(`${UID}`)
    .get();

  if (validation.exists) {
    const query = await modules.firestore
      .collection(leagueName)
      .doc(`${UID}`)
      .set(
        {
          [`${eventID}`]: {
            eventID: eventID,
            sport: sport,
            league: league,
            scheduled: time
          }
        },
        { merge: true }
      );
    output.push(
      UID + ' / ' + sport + ' / ' + league + ' / ' + eventID + ' has collected'
    );
  }

  return output;
}
module.exports = postCollect;
