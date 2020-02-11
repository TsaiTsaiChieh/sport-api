// const express = require('express');
// const router = express.Router();
const modules = require('../util/modules');
const api_key = '48v65d232xsk2am8j6yu693v';

// Just for NBA now
// async function prematch(req, res) {
async function prematch() {
  // const { date } = req.query;
  const date = modules
    .moment()
    // .subtract(1, 'days')
    .format('YYYY-MM-DD');
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);

  // If query today information, it will return tomorrow information
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${year}/${month}/${day}/schedule.json?api_key=${api_key}`;
  try {
    const { data } = await modules.axios(URL);
    data.games.forEach(function(ele) {
      modules.firestore
        .collection(modules.db.sport_18)
        .doc(ele.id)
        .set(repackagePreMatch(ele, data.league), { merge: true });
    });
    const result = `Daily Schedule on ${date} +1 successful, URL: ${URL}`;
    console.log(result);
    return result;
    // res.json(result);
  } catch (error) {
    console.log(
      'error happened in pubsub/prematch function by Tsai-Chieh',
      error
    );
    return error;
  }
}
function repackagePreMatch(ele, league) {
  data = {};
  data.update_time = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date()
  );
  data.status = ele.status;
  data.scheduled = modules.firebaseAdmin.firestore.Timestamp.fromDate(
    new Date(ele.scheduled)
  );
  data.league = {
    id: league.id,
    name: league.name,
    alias: league.alias
  };
  data.home = {
    name: ele.home.name,
    alias: ele.home.alias,
    id: ele.home.id,
    sr_id: ele.home.sr_id
  };
  data.away = {
    name: ele.away.name,
    alias: ele.away.alias,
    id: ele.away.id,
    sr_id: ele.away.sr_id
  };
  return data;
}
module.exports = prematch;
