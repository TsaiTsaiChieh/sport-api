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
  let time;
  if (league === 'eSoccer') {
    time = Date.now();
  } else {
    time = '2020-07-01';
  }

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
    let newestTotal;
    if (eventData[i].newest_totals) {
      newestTotal = eventData[i].newest_totals;
    } else {
      newestTotal = {
        handicap: 'no data',
        over_tw: 'no data'
      };
    }

    if (scheduled === dateNow && eventData[i].flag.status === 0) {
      closedEvent.push({
        league: eventData[i].league.name_ch,
        ori_league: eventData[i].league.name,
        sport: sport,
        status: eventData[i].flag.status,
        bets_id: eventData[i].bets_id,
        newest_spread: newestSpread.handicap,
        home_tw: newestSpread.home_tw,
        away_tw: newestSpread.away_tw,
        home: {
          team_name: eventData[i].home.team_name,
          player_name: eventData[i].home.player_name,
          name: eventData[i].home.name,
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id
        },
        away: {
          team_name: eventData[i].away.team_name,
          player_name: eventData[i].away.player_name,
          name: eventData[i].away.name,
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        }
      });
    }

    if (scheduled === dateNow && eventData[i].flag.status === 1) {
      outputJson.push({
        league: eventData[i].league.name_ch,
        ori_league: eventData[i].league.name,
        sport: sport,
        status: eventData[i].flag.status,
        bets_id: eventData[i].bets_id,
        newest_spread: newestSpread.handicap,
        home_tw: newestSpread.home_tw,
        away_tw: newestSpread.away_tw,
        home: {
          team_name: eventData[i].home.team_name,
          player_name: eventData[i].home.player_name,
          name: eventData[i].home.name,
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id
        },
        away: {
          team_name: eventData[i].away.team_name,
          player_name: eventData[i].away.player_name,
          name: eventData[i].away.name,
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        }
      });
    }

    if (scheduled === dateNow && eventData[i].flag.status === 2) {
      scheduledEvent.push({
        league: eventData[i].league.name_ch,
        ori_league: eventData[i].league.name,
        sport: sport,
        status: eventData[i].flag.status,
        bets_id: eventData[i].bets_id,
        newest_spread: newestSpread.handicap,
        home_tw: newestSpread.home_tw,
        away_tw: newestSpread.away_tw,
        home: {
          team_name: eventData[i].home.team_name,
          player_name: eventData[i].home.player_name,
          name: eventData[i].home.name,
          alias_ch: eventData[i].home.alias_ch,
          image_id: eventData[i].home.image_id
        },
        away: {
          team_name: eventData[i].away.team_name,
          player_name: eventData[i].away.player_name,
          name: eventData[i].away.name,
          alias_ch: eventData[i].away.alias_ch,
          image_id: eventData[i].away.image_id
        }
      });
    }
  }
  let countClose = 0;
  let counScheduled = 0;
  const lengthNow = outputJson.length;
  for (let i = 0; i < 4 - lengthNow; i++) {
    if (closedEvent[countClose]) {
      outputJson.push(closedEvent[countClose]);
      countClose = countClose + 1;
    } else {
      outputJson.push(scheduledEvent[counScheduled]);
      counScheduled = counScheduled + 1;
    }
  }
  const ll = outputJson.length;

  for (let i = 0; i < ll; i++) {
    if (outputJson[i] === undefined || outputJson[i] === null) {
      outputJson.pop();
    }
  }
  return outputJson;
}
module.exports = livescore;
