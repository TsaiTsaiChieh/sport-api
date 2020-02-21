const modules = require("../util/modules");

const axios = require("axios");
const nba_api_key = "y7uxzm4stjju6dmkspnabaav";

var gameID = "e253238c-2eac-4749-b28e-9cde1aed0303";
var scheduleTime = "2020-02-18T09:21:00+00:00";
var periodsNow = 0;
var eventsNow = 0;
var dataFromAPI;

var scheduleYear = parseInt(scheduleTime.substring(0, 4));
var scheduleMonth = parseInt(scheduleTime.substring(5, 7));
var scheduleDay = parseInt(scheduleTime.substring(8, 10));
var scheduleHour = parseInt(scheduleTime.substring(11, 13));
var scheduleMinute = parseInt(scheduleTime.substring(14, 16));
var scheduleSecond = parseInt(scheduleTime.substring(17, 19));
scheduleMonth = scheduleMonth - 1;

var date = new Date(
  scheduleYear,
  scheduleMonth,
  scheduleDay,
  scheduleHour,
  scheduleMinute,
  scheduleSecond
);
// console.log(date);

var ready = modules.nodeSchedule.scheduleJob(date, function() {
  async function intervalFunc() {
    var stopCondition = await NBApbpInplay(gameID);
    if (stopCondition === "closed") {
      await NBApbpHistory(gameID);
      clearInterval(interval);
      ready.cancel();
    }
  }
  const interval = setInterval(intervalFunc, 3000);
});

async function NBApbpInplay(gameID, scheduleTime) {
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  try {
    dataFromAPI = await axios(URL);

    var db = admin.database();

    for (
      var periodsCount = periodsNow;
      periodsCount < dataFromAPI.periods.length;
      periodsCount++
    ) {
      for (
        var eventsCount = eventsNow;
        eventsCount < dataFromAPI.periods[periodsCount].events.length;
        eventsCount++
      ) {
        var ref = db.ref(
          `basketball/${gameID}/pbp/periods${periodsCount}/events${eventsCount}`
        );
        // eslint-disable-next-line no-await-in-loop
        await ref.set(dataFromAPI.periods[periodsCount].events[eventsCount]);
      }
    }

    periodsNow = periodsCount - 1;
    eventsNow = eventsCount - 1;
    var stopCondition = dataFromAPI.status;
    return stopCondition;
  } catch (error) {
    console.log(
      "error happened in pubsub/NBApbpInplay function by page",
      error
    );
    return error;
  }
}

async function NBApbpHistory(gameID, scheduleTime) {
  try {
    var db = admin.firestore();
    var awayInfo = {
      teamAlias: dataFromAPI.away.alias,
      teamID: dataFromAPI.away.id,
      teamMarket: dataFromAPI.away.market,
      teamName: dataFromAPI.away.name,
      teamSrID: dataFromAPI.away.sr_id
    };
    var homeInfo = {
      teamAlias: dataFromAPI.home.alias,
      teamID: dataFromAPI.home.id,
      teamMarket: dataFromAPI.home.market,
      teamName: dataFromAPI.home.name,
      teamSrID: dataFromAPI.home.sr_id
    };
    var winner;
    if (dataFromAPI.home.points > dataFromAPI.away.points) {
      winner = "home";
    } else {
      winner = "away";
    }
    var finalScore = {
      homePoints: dataFromAPI.home.points,
      awayPoints: dataFromAPI.away.points,
      winner: winner
    };
    var dataOutput = {
      awayInfo: awayInfo,
      homeInfo: homeInfo,
      finalScore: finalScore,
      gameID: dataFromAPI.id,
      gameSrID: dataFromAPI.sr_id,
      startTime: dataFromAPI.scheduled
    };
    var ref = db.collection("basketball").doc(gameID);
    await ref.set(dataOutput);
    for (
      var periodsCount = 0;
      periodsCount < dataFromAPI.periods.length;
      periodsCount++
    ) {
      for (
        var eventsCount = 0;
        eventsCount < dataFromAPI.periods[periodsCount].events.length;
        eventsCount++
      ) {
        ref = db
          .collection("basketball")
          .doc(gameID)
          .collection("periods")
          .doc(`periods${periodsCount}`)
          .collection("events")
          .doc(`events${eventsCount}`);
        ref.set(data.periods[periodsCount].events[eventsCount]);
      }
    }
  } catch (error) {
    console.log(
      "error happened in pubsub/NBApbpHistory function by page",
      error
    );
    return error;
  }
}

module.exports = NBApbpInplay;
module.exports = NBApbpHistory;
