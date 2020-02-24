/* eslint-disable consistent-return */
// const express = require('express');
// const router = express.Router();
const modules = require('../util/modules');
const NBA_api_key = '48v65d232xsk2am8j6yu693v';
const global_api_key = 'n8bam2aeabvh358r8g6k83dj';
const NBA_functions = require('./util/prematchFunctions_NBA');
const SBL_functions = require('./util/prematchFunctions_SBL');
// for BetsAPI
const league_id = [2274, 8251]; // NBA, SBL
// Just for NBA & SBL now
// upcomming is BetsAPI, prematch is for sportradar
async function prematch() {
  const date = modules
    .moment()
    .add(1, 'days')
    .format('YYYY-MM-DD');
  const yesterday = modules
    .moment()
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  // const yesterday = '2020-02-21';
  // const date = dateFormat(currentDate);
  // const date = '2020-02-22';
  // NBA

  try {
    await NBA_functions.NBA.upcomming(date, league_id[0]);
    NBA_functions.NBA.prematch(yesterday, NBA_api_key);
  } catch (error) {
    console.log(error);
  }
  // const test_date = '2020-03-07';
  // try {
  //   await SBL_functions.SBL.upcomming(test_date, league_id[1]);
  //   SBL_functions.SBL.prematch(test_date, global_api_key);
  // } catch (error) {
  //   console.log(error);
  // }
  // upcomming_SBL(date);
  // prematch_SBL(date);
  // for endpoint test

  // res.json(results);
}

// eslint-disable-next-line consistent-return
async function upcomming_SBL(date) {
  const date_ = dateFormat(date);
  const URL = `https://api.betsapi.com/v2/events/upcoming?sport_id=18&token=${modules.betsToken}&league_id=${league_id[1]}&day=${date_.year}${date_.month}${date_.day}`;
  console.log(`BetsAPI SBL URL: ${URL}`);
  // axios
  const results = [];
  try {
    const { data } = await modules.axios(URL);
    for (let i = 0; i < data.results.length; i++) {
      let ele = data.results[i];
      results.push(
        modules.firestore
          .collection(modules.db.basketball)
          .doc(ele.id)
          .set(repackage_SBL_bets(ele), { merge: true })
      );
      console.log(`BetsAPI SBL match id: ${ele.id}`);
    }
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_SBL axios by TsaiChieh',
      error
    );
    return error;
  }
  // firestore
  try {
    await Promise.all(results);
  } catch (error) {
    console.log(
      'Error in pubsub/prematch upcomming_SBL function by TsaiChieh',
      error
    );
    return error;
  }
}
function repackage_SBL_bets(ele) {
  data = {};
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(Number.parseInt(ele.time) * 1000)
  );
  data.bets_id = ele.id;
  data.home = {
    alias: encode_SBL(ele.home.name, ele.home.id),
    // image_id: ele.home.image_id,
    bets_id: ele.home.id
  };
  data.away = {
    alias: encode_SBL(ele.away.name, ele.away.id),
    // image_id: ele.away.image_id,
    bets_id: ele.away.id
  };
  data.league = {
    bets_id: ele.league.id,
    name: ele.league.name.toUpperCase().replace('CHINESE TAIPEI ', '')
  };
  data.flag = {
    spread: 0,
    totals: 0,
    status: 2
  };
  return data;
}
// eslint-disable-next-line consistent-return
function encode_SBL(name, id) {
  name = name.toLowerCase();
  id = Number.parseInt(id);
  if (name === 'pauian' || id === 54440) return 'PAR';
  else if (name === 'taiwan beer' || id === 193059) return 'TAI';
  else if (name === 'yulon' || id === 192998) return 'YUL';
  else if (name === 'jeoutai basketball' || id === 303666) return 'JEO';
  else if (name === 'bank of taiwan' || id === 193057) return 'BAN';
}
async function prematch_SBL(date) {
  const date_ = dateFormat(date);
  // If query today information, it will return today information
  const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${date_.year}-${date_.month}-${date_.day}/summaries.json?api_key=${global_api_key}`;
  // const sportRadarURL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${year}-03-07/summaries.json?api_key=${global_api_key}`;
  try {
    const { data } = await modules.axios(sportRadarURL);
    const query = await query_SBL(date);

    for (let i = 0; i < data.summaries.length; i++) {
      const ele = data.summaries[i];
      if (ele.sport_event.sport_event_context !== undefined) {
        if (
          ele.sport_event.sport_event_context.competition.name.toUpperCase() ===
          'SBL'
        ) {
          integration_SBL(query, ele);
          console.log(
            `match_id: ${ele.sport_event.id.replace('sr:sport_event:', '')}`
          );
        }
      }
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/prematch/prematch_SBL axios or query by Tsai-Chieh',
      error
    );
    return error;
  }
  // const result = `Daily Schedule in SBL on ${date} +1 successful, URL: ${sportRadarURL}`;
  // console.log(result);
  // return result;
}
async function query_SBL(date) {
  const basketRef = modules.firestore.collection(modules.db.basketball);
  const beginningDate = modules.moment(date);
  const endDate = modules.moment(date).add(1, 'days');
  const results = [];
  try {
    const query = await basketRef
      .where('league.name', '==', 'SBL')
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
    return error;
  }
}
function integration_SBL(query, ele) {
  // query is BetsAPI saved in firestore, ele is SportRadar returned
  const milliseconds =
    modules.moment(ele.sport_event.start_time).valueOf() / 1000;
  // const results = [];
  for (let i = 0; i < query.length; i++) {
    if (
      milliseconds === query[i].scheduled._seconds &&
      ele.sport_event.competitors[0].abbreviation === query[i].home.alias
    ) {
      modules.firestore
        .collection(modules.db.basketball)
        .doc(query[i].bets_id)
        .set(repackage_SBL_sportradar(ele), { merge: true });
    }
  }
}
function repackage_SBL_sportradar(ele) {
  data = {};
  data.radar_id = ele.sport_event.id.replace('sr:sport_event:', '');
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.league = {
    radar_id: ele.sport_event.sport_event_context.competition.id,
    name: ele.sport_event.sport_event_context.competition.name.toUpperCase()
  };
  data.home = {
    radar_id: ele.sport_event.competitors[0].id,
    name: ele.sport_event.competitors[0].name
  };
  data.away = {
    radar_id: ele.sport_event.competitors[1].id,
    name: ele.sport_event.competitors[1].name
  };
  return data;
}

function dateFormat(date) {
  return {
    year: date.substring(0, 4),
    month: date.substring(5, 7),
    day: date.substring(8, 10)
  };
}
module.exports = prematch;
