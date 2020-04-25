const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(args.sport, args.league);

      resolve(result);
    } catch (err) {
      console.error('Error in sport/livescoreModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league) {
  const result = await repackage(sport, league);

  return await Promise.all(result);
}
async function repackage(sport, league) {
  // 目前時間寫死
  const time = '2020-07-01';
  // const time = Date.now();
  const leagueName = `pagetest_${league}`;
  const query = await modules.firestore
    .collection(leagueName)
    .orderBy('scheduled', 'desc')
    .get();

  const eventData = [];
  query.forEach((doc) => {
    eventData.push(doc.data());
  });

  let dateNow = new Date(time).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei'
  });
  dateNow = dateNow.split(' ')[0];

  let scheduled;
  const closedEvent = [];
  const inprogressEvent = [];
  const scheduledEvent = [];
  const outputJson = [];

  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(
      eventData[i].scheduled._seconds * 1000
    ).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    scheduled = scheduled.split(' ')[0];

    if (scheduled === dateNow && eventData[i].flag.status === 0) {
      // 針對讀取 firestore 做處理，配合 mysql 的 table 中會有 null 值的情況
      if (eventData[i].newest_spread.home_tw === '') {
        eventData[i].newest_spread.home_tw = null;
      }
      if (eventData[i].newest_spread.away_tw === '') {
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
          image_id: eventData[i].home.image_id
        },
        away: {
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        }
      });
    }

    if (scheduled === dateNow && eventData[i].flag.status === 1) {
      // 針對讀取 firestore 做處理，配合 mysql 的 table 中會有 null 值的情況
      if (eventData[i].newest_spread.home_tw === '') {
        eventData[i].newest_spread.home_tw = null;
      }
      if (eventData[i].newest_spread.away_tw === '') {
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
          image_id: eventData[i].home.image_id
        },
        away: {
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        }
      });
    }

    if (scheduled === dateNow && eventData[i].flag.status === 2) {
      // 針對讀取 firestore 做處理，配合 mysql 的 table 中會有 null 值的情況
      if (eventData[i].newest_spread.home_tw === '') {
        eventData[i].newest_spread.home_tw = null;
      }
      if (eventData[i].newest_spread.away_tw === '') {
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
          image_id: eventData[i].home.image_id
        },
        away: {
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        }
      });
    }
  }
  for (let i = 0; i < 4 - outputJson.length; i++) {
    if (closedEvent[i]) {
      outputJson.push(closedEvent[i]);
    } else {
      outputJson.push(scheduledEvent[i]);
    }
  }

  return outputJson;
}
module.exports = livescore;
