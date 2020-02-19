// const express = require('express');
// const router = express.Router();
const modules = require('../util/modules');
const nba_api_key = '48v65d232xsk2am8j6yu693v';
const global_api_key = 'n8bam2aeabvh358r8g6k83dj';
// Just for NBA & SBL now
// async function prematch(req, res) {
async function prematch() {
  const date = modules
    .moment()
    .add(1, 'days')
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  prematchForNBA(date);
  prematchForSBL(date);
  // for endpoint test
  // const results = await prematchForSBL(date);
  // res.json(results);
}
async function prematchForSBL(date) {
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);
  // If query today information, it will return tomorrow information
  const URL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${year}-${month}-${day}/summaries.json?api_key=${global_api_key}`;
  // const URL = `http://api.sportradar.us/basketball/trial/v2/en/schedules/${year}-03-07/summaries.json?api_key=${global_api_key}`;

  try {
    const { data } = await modules.axios(URL);
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
  const result = `Daily Schedule in SBL on ${date} +1 successful, URL: ${URL}`;
  console.log(result);
  return result;
}
async function prematchForNBA(date) {
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);

  // If query today information, it will return tomorrow information
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${year}/${month}/${day}/schedule.json?api_key=${nba_api_key}`;
  // const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${year}/${month}/14/schedule.json?api_key=${nba_api_key}`;

  try {
    const { data } = await modules.axios(URL);
    const ele = data.games;
    const results = [];
    for (let i = 0; i < ele.length; i++) {
      results.push(
        modules.firestore
          .collection(modules.db.sport_18)
          .doc(ele[i].id)
          .set(repackageForNBA(ele[i], data.league), { merge: true })
      );
      console.log(`match_id: ${ele[i].id}`);
    }
    try {
      await Promise.all(results);
      console.log(a);
    } catch (error) {
      console.log(
        'error happened in pubsub/prematch/prematchForNBA results variable by Tsai-Chieh',
        error
      );
      return error;
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/prematch/prematchForNBA axios function by Tsai-Chieh',
      error
    );
    return error;
  }
  const result = `Daily Schedule in NBA on ${date} +1 successful, URL: ${URL}`;
  console.log(result);
  return result;
  // res.json(result);
}
function repackageForSBL(ele) {
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
function repackageForNBA(ele, league) {
  data = {};
  data.id = ele.id;
  // data.sr_id = ele.sr_id;
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.status = ele.status;
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(ele.scheduled)
  );
  data.league = {
    id: league.id,
    name: league.name.toUpperCase(),
    alias: league.alias
  };
  data.home = {
    name: ele.home.name,
    alias: ele.home.alias,
    id: ele.home.id
  };

  data.away = {
    name: ele.away.name,
    alias: ele.away.alias,
    id: ele.away.id
    // sr_id: ele.away.sr_id
  };
  if (ele.home.sr_id) data.home.sr_id = ele.home.sr_id;
  if (ele.away.sr_id) data.away.sr_id = ele.away.sr_id;
  if (ele.sr_id) data.sr_id = ele.sr_id;
  return data;
}
module.exports = prematch;
