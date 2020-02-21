// const express = require('express');
// const router = express.Router();
const modules = require('../util/modules');
const nba_api_key = '48v65d232xsk2am8j6yu693v';
const global_api_key = 'n8bam2aeabvh358r8g6k83dj';
// for BetsAPI
const league_id = [2274]; // NBA
// Just for NBA & SBL now
// upcomming is BetsAPI, prematch is for sportradar
async function prematch(req, res) {
  // async function prematch() {
  const currentDate = modules
    .moment()
    .add(1, 'days')
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  // const yesterday = modules
  //   .moment()
  //   .subtract(1, 'days')
  //   .format('YYYY-MM-DD');
  const yesterday = '2020-02-21';
  // const date = dateFormat(currentDate);
  const date = {
    year: '2020',
    month: '02',
    day: '22'
  };

  upcomming_NBA(date);
  // prematch_NBA(yesterday);
  // prematchForSBL(date);
  // for endpoint test
  // const results = await prematchForSBL(date);
  // res.json(results);
}
async function upcomming_NBA(date) {
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=18&token=${modules.betsToken}&league_id=${league_id[0]}&day=${date.year}${date.month}${date.day}`;
  console.log(`BetsAPI URL: ${URL}`);
  // axios
  const results = [];
  try {
    const { data } = await modules.axios(URL);
    for (let i = 0; i < data.results.length; i++) {
      let ele = data.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.bets_18)
          .doc(ele.id)
          .set(repackage_NBA_bets(ele), { merge: true })
      );
      console.log(`BetsAPI match id: ${ele.id}`);
    }
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_NBA axios by TsaiChieh',
      error
    );
    return error;
  }
  // firestore
  try {
    await Promise.all(results);
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_NBA function by TsaiChieh',
      error
    );
    return error;
  }
}
function repackage_NBA_bets(ele) {
  data = {};
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(Number.parseInt(ele.time) * 1000)
  );
  data.bets_id = ele.id;
  data.home = {
    alias: encode_NBA(ele.home.name),
    image_id: ele.home.image_id,
    bets_id: ele.home.id
  };
  data.away = {
    name: encode_NBA(ele.away.name),
    image_id: ele.away.image_id,
    bets_id: ele.away.id
  };
  data.league = {
    bets_id: ele.league.id,
    name: ele.league.name.toUpperCase()
  };
  data.flag = {
    spread: 0,
    totals: 0,
    status: 2
  };
  return data;
}
function encode_NBA(name) {
  name = name.toLowerCase();
  switch (name) {
    case 'gs warriors':
      return 'GSW';
    case 'sa spurs':
      return 'SAS';
    case 'la clippers':
      return 'LAC';
    case 'la lakers':
      return 'LAL';
    case 'ny knicks':
      return 'NYK';
    case 'no pelicans':
      return 'NOP';
    default:
      return name.substring(0, 3).toUpperCase();
  }
}
async function prematch_NBA(date) {
  const date_ = dateFormat(date);
  // If query today information, it will return tomorrow information
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${date_.year}/${date_.month}/${date_.day}/schedule.json?api_key=${nba_api_key}`;
  const { data } = await modules.axios(URL);
  const query = await query_NBA(date);

  // for (let i = 0; i < data.games.length; i++) {
  for (let i = 0; i < 1; i++) {
    let ele = data.games[i];
    integration(query, ele);
    // console.log(repackage_NBA_sportradar(ele, data.league));
    // integration(ele, date);
  }
  // try {
  //   const { data } = await modules.axios(URL);
  //   const ele = data.games;
  //   const results = [];
  //   for (let i = 0; i < ele.length; i++) {
  //     results.push(
  //       modules.firestore
  //         .collection(modules.db.sport_18)
  //         .doc(ele[i].id)
  //         .set(repackageForNBA(ele[i], data.league), { merge: true })
  //     );
  //     console.log(`match_id: ${ele[i].id}`);
  //   }
  //   try {
  //     await Promise.all(results);
  //   } catch (error) {
  //     console.log(
  //       'error happened in pubsub/prematch/prematchForNBA results variable by Tsai-Chieh',
  //       error
  //     );
  //     return error;
  //   }
  // } catch (error) {
  //   console.log(
  //     'error happened in pubsub/prematch/prematchForNBA axios function by Tsai-Chieh',
  //     error
  //   );
  //   return error;
  // }
  // const result = `Daily Schedule in NBA on ${date} +1 successful, URL: ${sportRadarURL}`;
  // console.log(result);
  // return result;
}
function integration(query, ele) {
  // console.log(ele.scheduled);

  // console.log(modules.moment(ele.scheduled).valueOf() / 1000);
  const milliseconds = modules.moment(ele.scheduled).valueOf() / 1000;
  console.log(milliseconds, ele.home.alias.toUpperCase());

  for (let i = 0; i < query.length; i++) {
    console.log(query[i].scheduled._seconds, query[i].home.alias);

    if (
      (milliseconds === query[i].scheduled._seconds) &
      (ele.home.alias.toUpperCase() === query[i].home.alias)
    )
      console.log(query[i]);
  }
}
async function query_NBA(date) {
  const basketRef = modules.firestore.collection(modules.db.bets_18);
  const beginningDate = modules.moment(date).add(1, 'days');
  const endDate = modules.moment(date).add(2, 'days');
  const results = [];
  try {
    const query = await basketRef
      .where('league.name', '==', 'NBA')
      .where('scheduled', '>=', beginningDate)
      .where('scheduled', '<', endDate)
      .get();

    query.forEach(async function(ele) {
      results.push(ele.data());
    });
    await Promise.all(results);
    return results;
  } catch (error) {
    console.log('Error in pubsub/prematch integration function by TsaiChieh');
  }
}
function repackage_NBA_sportradar(ele, league) {
  data = {};
  data.radar_id = ele.id;
  // data.status = ele.status;
  // data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
  //   new Date(ele.scheduled)
  // );
  data.league = {
    radar_id: league.id
    // name: league.name.toUpperCase(),
    // alias: league.alias
  };
  data.home = {
    name: ele.home.name,
    // alias: ele.home.alias,
    radar_id: ele.home.id
  };

  data.away = {
    name: ele.away.name,
    // alias: ele.away.alias,
    radar_id: ele.away.id
  };
  data.venue = {
    name: ele.venue.name,
    city: ele.venue.city,
    country: ele.venue.country
  };
  if (ele.home.sr_id) data.home.sr_id = ele.home.sr_id;
  if (ele.away.sr_id) data.away.sr_id = ele.away.sr_id;
  if (ele.sr_id) data.sr_id = ele.sr_id;
  return data;
}
async function prematchForSBL(date) {
  // If query today information, it will return tomorrow information
  const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${date.year}-${date.month}-${date.day}/summaries.json?api_key=${global_api_key}`;
  // const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${year}-03-07/summaries.json?api_key=${global_api_key}`;

  try {
    const { data } = await modules.axios(sportRadarURL);
    const ele = data.summaries;
    const results = [];
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].sport_event.sport_event_context !== undefined) {
        if (
          ele[
            i
          ].sport_event.sport_event_context.competition.name.toUpperCase() ===
          'SBL'
        ) {
          results.push(
            modules.firestore
              .collection(modules.db.sport_18)
              .doc(ele[i].sport_event.id.replace('sr:sport_event:', ''))
              .set(repackageForSBL(ele[i]), { merge: true })
          );
          console.log(
            `match_id: ${ele[i].sport_event.id.replace('sr:sport_event:', '')}`
          );
        }
      }
    }
    try {
      await Promise.all(results);
    } catch (error) {
      console.log(
        'error happened in pubsub/prematch/prematchForSBL results variable by Tsai-Chieh',
        error
      );
      return error;
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/prematch/prematchForSBL axios function by Tsai-Chieh',
      error
    );
    return error;
  }
  const result = `Daily Schedule in SBL on ${date} +1 successful, URL: ${sportRadarURL}`;
  console.log(result);
  return result;
}

function repackageForSBL(ele, date) {
  data = {};
  data.id = ele.sport_event.id.replace('sr:sport_event:', '');
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.status = ele.sport_event_status.status;
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(ele.sport_event.start_time)
  );
  data.league = {
    id: ele.sport_event.sport_event_context.competition.id,
    name: ele.sport_event.sport_event_context.competition.name.toUpperCase()
  };
  data.home = {
    id: ele.sport_event.competitors[0].id.substring('sr:competitor:', ''),
    name: ele.sport_event.competitors[0].name,
    alias: ele.sport_event.competitors[0].abbreviation
  };
  data.away = {
    id: ele.sport_event.competitors[1].id.substring('sr:competitor:', ''),
    name: ele.sport_event.competitors[1].name,
    alias: ele.sport_event.competitors[1].abbreviation
  };
  return data;
}

function betsMergeForNBA(ele) {
  console.log(ele);
}
function dateFormat(date) {
  return {
    year: date.substring(0, 4),
    month: date.substring(5, 7),
    day: date.substring(8, 10)
  };
}
module.exports = prematch;
