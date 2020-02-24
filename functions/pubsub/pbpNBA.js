const modules = require("../util/modules");

const axios = require("axios");
const nba_api_key = "y7uxzm4stjju6dmkspnabaav";

async function NBApbpInplay(gameID, betsID, periodsNow, eventsNow) {
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;

  try {
    dataFromAPI = await axios(URL);
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
        var ref = modules.database.ref(
          `basketball/NBA/${gameID}/periods${periodsCount}/events${eventsCount}`
        );
        // eslint-disable-next-line no-await-in-loop
        await ref.set(dataFromAPI.periods[periodsCount].events[eventsCount]);
      }
    }
  } catch (error) {
    console.log(
      "error happened in pubsub/NBApbpInplay function by page",
      error
    );
    return error;
  }

  periodsNow = periodsCount - 1;
  eventsNow = eventsCount - 1;
  return [periodsNow, eventsNow];
}
async function NBApbpHistory(gameID, betsID) {
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  try {
    dataFromAPI = await axios(URL);

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
    var ref = modules.firestore.collection("test_basketball").doc(betsID);
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
        ref = db.collection("test_basketball").doc(betsID);
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
module.exports = { NBApbpInplay, NBApbpHistory };
