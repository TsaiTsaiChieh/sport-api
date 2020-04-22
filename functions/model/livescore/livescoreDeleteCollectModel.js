const modules = require('../../util/modules');

function postCollect(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await reResult(
        args.sport,
        args.league,
        args.UID,
        args.eventID
      );

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescorePostCollectModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league, UID, eventID) {
  const result = await repackage(sport, league, UID, eventID);

  return await Promise.all(result);
}
async function repackage(sport, league, UID, eventID) {
  const leagueName = `pagetest_${league}_member`;
  const output = [];
  const validation = await modules.firestore
    .collection(leagueName)
    .doc(`${UID}`)
    .get();

  if (validation.exists) {
    const FieldValue = require('firebase-admin').firestore.FieldValue;
    const query = await modules.firestore
      .collection(leagueName)
      .doc(`${UID}`)
      .update({ [`${eventID}`]: FieldValue.delete() });
    output.push(
      UID + ' / ' + sport + ' / ' + league + ' / ' + eventID + ' has deleted'
    );
  }

  return output;
}
module.exports = postCollect;
