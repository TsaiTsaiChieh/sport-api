const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let result = await reResult(args.sport, args.league);

      resolve(result);
    } catch (err) {
      console.error('Error in sport/livescoreModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league) {
  let result;
  result = await repackage(sport, league);

  return await Promise.all(result);
}
async function repackage(sport, league) {
  let leagueName = `pagetest_${league}`;
  let query = await modules.firestore
    .collection(leagueName)
    .orderBy('scheduled', 'desc')
    .get();

  let eventData = [];
  query.forEach(doc => {
    eventData.push(doc.data());
  });

  let dateNow = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  dateNow = dateNow.split(' ')[0];

  let scheduled;
  let scheduledEvent = [];

  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(
      eventData[i].scheduled._seconds * 1000
    ).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    scheduled = scheduled.split(' ')[0];

    // 2 目前當天有幾場比賽規劃中
    if (scheduled === dateNow && eventData[i].flag.status == 2) {
      scheduledEvent.push(eventData[i]);
    }
  }
  scheduledEvent.push({ sport: sport });
  scheduledEvent.push({ league: league });
  return scheduledEvent;
}
module.exports = livescore;
