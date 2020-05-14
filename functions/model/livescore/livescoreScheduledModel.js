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
  let leagueName;

  if (league === 'eSoccer') {
    leagueName = `pagetest_${league}`;
  } else {
    leagueName = `${sport}_${league}`;
  }
  const begin = modules.convertTimezone(time);
  const end =
    modules.convertTimezone(time, {
      op: 'add',
      value: 1,
      unit: 'days'
    }) - 1;

  const query = await modules.firestore
    .collection(leagueName)
    .where('flag.status', '==', 2)
    .where('scheduled', '>=', begin)
    .where('scheduled', '<=', end)
    .get();

  const eventData = [];
  query.forEach((doc) => {
    eventData.push(doc.data());
  });

  let scheduled;
  const scheduledEvent = [];

  for (let i = 0; i < eventData.length; i++) {
    scheduled = new Date(eventData[i].scheduled * 1000).toLocaleString(
      'zh-TW',
      { timeZone: 'Asia/Taipei' }
    );
    scheduled = scheduled.split(' ')[0];
    let newestSpread;
    if (eventData[i].newest_spread) {
      newestSpread = eventData[i].newest_spread;
    } else {
      newestSpread = {
        handicap: 'no data',
        home_tw: 'no data',
        away_tw: 'no data'
      };
    }
    // let newestTotal;
    // if (eventData[i].newest_total) {
    //   newestTotal = eventData[i].newest_total;
    // } else {
    //   newestTotal = {
    //     handicap: 'no data',
    //     over_tw: 'no data'
    //   };
    // }
    if (league === 'eSoccer') {
      league = eventData[i].league.name;
    }
    // 2 目前當天有幾場比賽規劃中

    scheduledEvent.push({
      sport: sport,
      league: eventData[i].league.name_ch,
      ori_league: eventData[i].league.name,
      scheduled: eventData[i].scheduled * 1000,
      home: {
        team_name: eventData[i].home.team_name,
        player_name: eventData[i].home.player_name,
        name: eventData[i].home.name,
        name_ch: eventData[i].home.name_ch,
        alias: eventData[i].home.alias,
        alias_ch: eventData[i].home.alias_ch,
        image_id: eventData[i].home.image_id
      },
      away: {
        team_name: eventData[i].away.team_name,
        player_name: eventData[i].away.player_name,
        name: eventData[i].away.name,
        name_ch: eventData[i].away.name_ch,
        alias: eventData[i].away.alias,
        alias_ch: eventData[i].away.alias_ch,
        image_id: eventData[i].away.image_id
      },
      newest_spread: {
        handicap: newestSpread.handicap,
        home_tw: newestSpread.home_tw,
        away_tw: newestSpread.away_tw
      },
      flag: {
        status: eventData[i].flag.status
      },
      bets_id: eventData[i].bets_id
    });
  }

  return scheduledEvent;
}
module.exports = livescore;
