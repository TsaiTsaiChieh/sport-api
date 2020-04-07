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
    let FieldValue = require('firebase-admin').firestore.FieldValue;
    let query = await modules.firestore
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
