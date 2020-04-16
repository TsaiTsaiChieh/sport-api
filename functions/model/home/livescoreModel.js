const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function (resolve, reject) {
    try {
      result = await reResult(args.sport, args.league);

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
  query.forEach((doc) => {
    eventData.push(doc.data());
  });

  time = '2020-07-01';
  let dateNow = new Date(time).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
  });

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

    if (scheduled === dateNow && eventData[i].flag.status == 0) {
      if (eventData[i].newest_spread.home_tw == '') {
        eventData[i].newest_spread.home_tw = null;
      }
      if (eventData[i].newest_spread.away_tw == '') {
        eventData[i].newest_spread.away_tw = null;
      }
      closedEvent.push({
        league: league,
        sport: sport,
        bets_id: eventData[i].bets_id,
        newest_spread: eventData[i].newest_spread.handicap,
        home_tw: eventData[i].newest_spread.home_tw,
        away_tw: eventData[i].newest_spread.away_tw,
        home: {
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id,
        },
        away: {
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id,
        },
      });
    }

    if (scheduled === dateNow && eventData[i].flag.status == 1) {
      if (eventData[i].newest_spread.home_tw == '') {
        eventData[i].newest_spread.home_tw = null;
      }
      if (eventData[i].newest_spread.away_tw == '') {
        eventData[i].newest_spread.away_tw = null;
      }
      outputJson.push({
        league: league,
        sport: sport,
        bets_id: eventData[i].bets_id,
        newest_spread: eventData[i].newest_spread.handicap,
        home_tw: eventData[i].newest_spread.home_tw,
        away_tw: eventData[i].newest_spread.away_tw,
        home: {
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id,
        },
        away: {
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id,
        },
      });
    }

    if (scheduled === dateNow && eventData[i].flag.status == 2) {
      if (eventData[i].newest_spread.home_tw == '') {
        eventData[i].newest_spread.home_tw = null;
      }
      if (eventData[i].newest_spread.away_tw == '') {
        eventData[i].newest_spread.away_tw = null;
      }
      scheduledEvent.push({
        league: league,
        sport: sport,
        bets_id: eventData[i].bets_id,
        newest_spread: eventData[i].newest_spread.handicap,
        home_tw: eventData[i].newest_spread.home_tw,
        away_tw: eventData[i].newest_spread.away_tw,
        home: {
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id,
        },
        away: {
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id,
        },
      });
    }
  }

  if (outputJson.length == 0) {
    for (let i = 0; i < 4; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 1) {
    for (let i = 0; i < 3; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 2) {
    for (let i = 0; i < 2; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  if (outputJson.length == 3) {
    for (let i = 0; i < 1; i++) {
      if (closedEvent[i]) {
        outputJson.push(closedEvent[i]);
      }
    }
  }
  return outputJson;
}
module.exports = livescore;
