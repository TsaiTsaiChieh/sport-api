const modules = require("../util/modules");

const axios = require("axios");
//const nba_api_key = "y7uxzm4stjju6dmkspnabaav";
//const nba_api_key = "bj7tvgz7qpsqjqaxmzsaqdnp";

async function NBApbpInplay(gameID, betsID, periodsNow, eventsNow) {
  const nba_api_key = "6mmty4jtxz3guuy62a4yr5u5";
  const timesPerLoop = 11;
  const firestoreName = "pagetest";
  console.log(betsID);
  let countForStatus2 = 0;
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  let changePeriods = true;
  let timerForStatus2 = setInterval(async function() {
    try {
      let { data } = await axios(URL);
      let ref = modules.database.ref(`basketball/NBA/${betsID}/Summary/status`);
      await ref.set(data.status);

      for (
        let periodsCount = periodsNow;
        periodsCount < data.periods.length;
        periodsCount++
      ) {
        if (periodsCount != periodsNow && changePeriods) {
          eventsNow = 0;
          changePeriods = false;
        }
        for (
          let eventsCount = eventsNow;
          eventsCount < data.periods[periodsCount].events.length;
          eventsCount++
        ) {
          let ref = modules.database.ref(
            `basketball/NBA/${betsID}/PBP/periods${periodsCount}/events${eventsCount}`
          );
          // eslint-disable-next-line no-await-in-loop
          await ref.set(data.periods[periodsCount].events[eventsCount]);
        }
      }
      // write another information

      ref = modules.database.ref(`basketball/NBA/${betsID}/Summary/homepoints`);
      await ref.set(data.home.points);
      ref = modules.database.ref(`basketball/NBA/${betsID}/Summary/awaypoints`);
      await ref.set(data.away.points);

      //maybe call summary API
    } catch (error) {
      console.log(
        "error happened in pubsub/NBApbpInplay function by page",
        error
      );
    }
    countForStatus2 = countForStatus2 + 1;

    if (countForStatus2 >= timesPerLoop) {
      modules.firestore
        .collection(firestoreName)
        .doc(betsID)
        .set({ flag: { status: 1 } }, { merge: true });
      clearInterval(timerForStatus2);
    }
  }, 5000);
  // change the status to 1
}
async function NBApbpHistory(gameID, betsID) {
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  try {
    let { data } = await axios(URL);

    let winner;
    if (data.home.points > data.away.points) {
      winner = "home";
    } else {
      winner = "away";
    }
    let finalResult = {
      homePoints: data.home.points,
      awayPoints: data.away.points,
      winner: winner
    };
    let dataOutput = {
      boxscore: finalResult
    };
    let ref = modules.firestore.collection(firestoreName).doc(betsID);
    await ref.set(dataOutput, { merge: true });
    for (
      let periodsCount = 0;
      periodsCount < data.periods.length;
      periodsCount++
    ) {
      for (
        let eventsCount = 0;
        eventsCount < data.periods[periodsCount].events.length;
        eventsCount++
      ) {
        ref = modules.firestore.collection(firestoreName).doc(betsID);
        // eslint-disable-next-line no-await-in-loop
        // await ref.set(
        //   { pbp: data.periods[periodsCount].events[eventsCount] },
        //   { merge: true }
        // );
      }
    }
  } catch (error) {
    console.log(
      "error happened in pubsub/NBApbpHistory function by page",
      error
    );
    return error;
  }
  // change the status to 1
  modules.firestore
    .collection(firestoreName)
    .doc(betsID)
    .set({ flag: { status: 0 } }, { merge: true });
}
module.exports = { NBApbpInplay, NBApbpHistory };
