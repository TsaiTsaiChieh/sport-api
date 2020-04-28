const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      const result = await reResult(args.sport, args.league, args.eventID);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreDetailPBPModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league, eventID) {
  const result = await repackage(sport, league, eventID);

  return await Promise.all(result);
}
async function repackage(sport, league, eventID) {
  const leagueName = `pagetest_${league}`;
  const eventData = [];
  const query = await modules.firestore
    .collection(leagueName)
    .where('bets_id', '==', eventID)
    .get();

  query.forEach((doc) => {
    eventData.push(doc.data());
  });

  if (league === 'eSoccer') {
    league = eventData[i].league.name;
  }
  eventData[0].sport = sport;
  eventData[0].league = league;
  return eventData;
}
module.exports = livescore;
