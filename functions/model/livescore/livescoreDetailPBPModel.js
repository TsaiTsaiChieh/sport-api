const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let result = await reResult(args.sport, args.league, args.eventID);
      console.log(args.sport);

      resolve(result);
    } catch (err) {
      console.error('Error in livescore/livescoreDetailPBPModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league, eventID) {
  let result;
  result = await repackage(sport, league, eventID);

  return await Promise.all(result);
}
async function repackage(sport, league, eventID) {
  let leagueName = `pagetest_${league}`;
  let eventData = [];
  let query = await modules.firestore
    .collection(leagueName)
    .where('bets_id', '==', eventID)
    .get();

  query.forEach(doc => {
    eventData.push(doc.data());
  });

  let dateNow = new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei'
  });
  dateNow = dateNow.split(' ')[0];
  let outputJson = [];
  outputJson.push({
    homeName: eventData[0].home.name_ch,
    awayName: eventData[0].away.name_ch,
    bets_id: eventData[0].bets_id,
    flag: { status: eventData[0].flag.status },
    radar_id: eventData[0].radar_id,
    scheduled: eventData[0].scheduled._seconds
  });
  eventData.push({ sport: sport });
  eventData.push({ league: league });
  return eventData;
}
module.exports = livescore;
