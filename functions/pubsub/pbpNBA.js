const modules = require("../util/modules");

const axios = require("axios");
const nba_api_key = "y7uxzm4stjju6dmkspnabaav";

async function NBApbpInplay(gameID, periodsNow, eventsNow) {
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
        var ref = db.ref(
          `basketball/${gameID}/pbp/periods${periodsCount}/events${eventsCount}`
        );
        // eslint-disable-next-line no-await-in-loop
        // await ref.set(dataFromAPI.periods[periodsCount].events[eventsCount]);
      }
    }
  } catch (error) {
    console.log(
      "error happened in pubsub/NBApbpInplay function by page",
      error
    );
    return error;
  }
  console.log(gameID, periodsNow, eventsNow);
}
module.exports = NBApbpInplay;
