const modules = require('../../util/modules');
async function livescore(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await reResult(args.sport, args.league, args.time);

      resolve(result);
    } catch (err) {
      console.error('Error in sport/livescoreModel by DY', err);
      reject({ code: 500, error: err });
    }
  });
}
async function reResult(sport, league, time) {
  const result = await repackage(sport, league, time);

  return await Promise.all(result);
}
async function repackage(sport, league, time) {
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
  const inprogressEvent = [];

  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(
      eventData[i].scheduled._seconds * 1000
    ).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    scheduled = scheduled.split(' ')[0];

    // 1 目前當天有幾場比賽進行中
    if (scheduled === dateNow && eventData[i].flag.status === 1) {
      eventData[i].sport = sport;
      eventData[i].league = league;
      inprogressEvent.push({
        home: {
          name: eventData[i].home.name,
          name_ch: eventData[i].home.name_ch,
          alias: eventData[i].home.alias,
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id
        },
        away: {
          name: eventData[i].away.name,
          name_ch: eventData[i].away.name_ch,
          alias: eventData[i].away.alias,
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        },
        newest_spread: {
          handicap: eventData[i].newest_spread.handicap,
          home_tw: eventData[i].newest_spread.home_tw,
          away_tw: eventData[i].newest_spread.away_tw
        },
        flag: {
          status: eventData[i].flag.status
        },
        bets_id: eventData[i].bets_id
      });
    }
  }

  return inprogressEvent;
}
module.exports = livescore;
