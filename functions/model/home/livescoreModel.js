const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const results = [];
      result = await reResult(args.league);

      resolve(result);
    } catch (err) {
      console.error('Error in sport/livescoreModel by DY', err);
      reject({ code: 500, error: err });
      return;
    }
  });
}
async function reResult(league) {
  let result;
  result = await repackage(league);

  return await Promise.all(result);
}
async function repackage(league) {
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
  let eventToday = [];
  let closedEvent = [];
  let inprogressEvent = [];
  let scheduledEvent = [];
  let outputJson = [];
  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(
      eventData[i].scheduled._seconds * 1000
    ).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    scheduled = scheduled.split(' ')[0];

    if (scheduled === dateNow) {
      eventToday.push(eventData[i]);
    }
    // 0 目前當天有幾場比賽已結束
    if (scheduled === dateNow && eventData[i].flag.status == 0) {
      closedEvent.push(eventData[i]);
    }

    // 1 目前當天有幾場比賽進行中
    if (scheduled === dateNow && eventData[i].flag.status == 1) {
      outputJson.push(eventData[i]);
    }
    // 2 目前當天有幾場比賽規劃中
    if (scheduled === dateNow && eventData[i].flag.status == 2) {
      scheduledEvent.push(eventData[i]);
    }
  }

  if (outputJson.length == 0) {
    for (let i = 0; i < 3; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 1) {
    for (let i = 0; i < 2; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 2) {
    for (let i = 0; i < 1; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  //   console.log(outputJson[0]);

  return outputJson;
}
module.exports = livescore;
