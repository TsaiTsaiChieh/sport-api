const modules = require("../util/modules");

const axios = require("axios");
const nba_api_key = "y7uxzm4stjju6dmkspnabaav";
let countForStatus2 = 0;
const timesPerLoop = 11;
const firestoreName = "basketball_page";
async function NBApbpInplay(gameID, betsID, periodsNow, eventsNow) {
  const URL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;

  let timerForStatus2 = setInterval(async function() {
    try {
      let { data } = await axios(URL);

      for (
        let periodsCount = periodsNow;
        periodsCount < data.periods.length;
        periodsCount++
      ) {
        for (
          let eventsCount = eventsNow;
          eventsCount < data.periods[periodsCount].events.length;
          eventsCount++
        ) {
          let ref = modules.database.ref(
            `basketball/NBA/${betsID}/periods${periodsCount}/events${eventsCount}`
          );
          // eslint-disable-next-line no-await-in-loop
          await ref.set(data.periods[periodsCount].events[eventsCount]);
        }
      }
      let ref = modules.database.ref(`basketball/NBA/${betsID}/status`);
      await ref.set(data.status);
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
    data = await axios(URL);

    let awayInfo = {
      teamAlias: data.away.alias,
      teamID: data.away.id,
      teamMarket: data.away.market,
      teamName: data.away.name,
      teamSrID: data.away.sr_id
    };
    let homeInfo = {
      teamAlias: data.home.alias,
      teamID: data.home.id,
      teamMarket: data.home.market,
      teamName: data.home.name,
      teamSrID: data.home.sr_id
    };
    let winner;
    if (data.home.points > data.away.points) {
      winner = "home";
    } else {
      winner = "away";
    }
    let finalScore = {
      homePoints: data.home.points,
      awayPoints: data.away.points,
      winner: winner
    };
    let dataOutput = {
      awayInfo: awayInfo,
      homeInfo: homeInfo,
      finalScore: finalScore,
      gameID: data.id,
      gameSrID: data.sr_id,
      startTime: data.scheduled
    };
    let ref = modules.firestore.collection(firestoreName).doc(betsID);
    await ref.set(dataOutput);
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
        ref = db.collection(firestoreName).doc(betsID);
        // eslint-disable-next-line no-await-in-loop
        await ref.set(
          { pbp: data.periods[periodsCount].events[eventsCount] },
          { merge: true }
        );
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
