const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      let result = await reResult(args.sport, args.league, args.time);

      resolve(result);
    } catch (err) {
      console.error('Error in sport/livescoreModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(sport, league, time) {
  let result;
  result = await repackage(sport, league, time);

  return await Promise.all(result);
}
async function repackage(sport, league, time) {
  let leagueName = `pagetest_${league}`;
  let query = await modules.firestore
    .collection(leagueName)
    .orderBy('scheduled', 'desc')
    .get();

  let eventData = [];
  query.forEach(doc => {
    eventData.push(doc.data());
  });

  let dateNow = new Date(parseInt(time)).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei'
  });
  dateNow = dateNow.split(' ')[0];

  let scheduled;
  let inprogressEvent = [];

  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(
      eventData[i].scheduled._seconds * 1000
    ).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    scheduled = scheduled.split(' ')[0];

    // 1 目前當天有幾場比賽進行中
    if (scheduled === dateNow && eventData[i].flag.status == 1) {
      eventData[i].sport = sport;
      eventData[i].league = league;
      inprogressEvent.push(eventData[i]);
    }
  }

  return inprogressEvent;
}
module.exports = livescore;
