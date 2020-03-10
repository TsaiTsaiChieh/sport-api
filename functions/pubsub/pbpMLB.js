const modules = require("../util/modules");
const axios = require("axios");

async function MLBpbpInplay(parameter) {
  let gameID = parameter.gameID;
  let betsID = parameter.betsID;
  let inningsNow = parameter.inningsNow;
  let halfNow = parameter.halfNow;
  let eventHalfNow = parameter.eventHalfNow;
  let eventAtbatNow = parameter.eventAtbatNow;

  const mlb_api_key = "qr8rjv3kzzdhdzzbx2rzx2h2";
  const timesPerLoop = 11;
  const firestoreName = "pagetest_MLB";
  let countForStatus2 = 0;
  const URL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  let changeInnings = true;
  let changeHalfs = true;
  let changeEventHalf = true;
  let timerForStatus2 = setInterval(async function() {
    try {
      let { data } = await axios(URL);
      let ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/status`);
      await ref.set(data.game.status);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/home/runs`);
      await ref.set(data.game.scoring.home.runs);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/home/hits`);
      await ref.set(data.game.scoring.home.hits);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/home/errors`);
      await ref.set(data.game.scoring.home.errors);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/away/runs`);
      await ref.set(data.game.scoring.away.runs);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/away/hits`);
      await ref.set(data.game.scoring.away.hits);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/away/errors`);
      await ref.set(data.game.scoring.away.errors);

      for (
        let inningsCount = inningsNow;
        inningsCount < data.game.innings.length;
        inningsCount++
      ) {
        // lineup
        if (inningsCount == 0) {
          let homeLineupLength = data.game.innings[0].halfs[1].events.length;
          let awayLineupLength = data.game.innings[0].halfs[0].events.length;
          for (
            let numberCount = 0;
            numberCount < homeLineupLength;
            numberCount++
          ) {
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/home/lineup${numberCount}`
            );
            await ref.set(data.game.innings[0].halfs[1].events[numberCount]);
          }
          for (
            let numberCount = 0;
            numberCount < awayLineupLength;
            numberCount++
          ) {
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/away/lineup${numberCount}`
            );
            await ref.set(data.game.innings[0].halfs[0].events[numberCount]);
          }
          //data.game.innings[0].halfs[0].events[0~10].lineup  away team = 上半場
        }
        if (inningsCount >= 1) {
          // normal play

          ref = modules.database.ref(
            `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/scoring/home/runs`
          );
          await ref.set(data.game.innings[inningsCount].scoring.home.runs);
          ref = modules.database.ref(
            `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/scoring/away/runs`
          );
          await ref.set(data.game.innings[inningsCount].scoring.away.runs);
          ref = modules.database.ref(
            `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/scoring/home/hits`
          );
          await ref.set(data.game.innings[inningsCount].scoring.home.hits);
          ref = modules.database.ref(
            `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/scoring/away/hits`
          );
          await ref.set(data.game.innings[inningsCount].scoring.away.hits);
          ref = modules.database.ref(
            `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/scoring/home/errors`
          );
          await ref.set(data.game.innings[inningsCount].scoring.home.errors);
          ref = modules.database.ref(
            `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/scoring/away/errors`
          );
          await ref.set(data.game.innings[inningsCount].scoring.away.errors);
          if (inningsCount != inningsNow && changeInnings) {
            halfCount = 0;
            changeInnings = false;
          }
          //0305
          for (
            let halfCount = halfNow;
            halfCount < data.game.innings[inningsCount].halfs.length;
            halfCount++
          ) {
            if (halfCount != halfNow && changeHalfs) {
              eventHalfNow = 0;
              changeHalfs = false;
            }
            for (
              let eventHalfCount = eventHalfNow;
              eventHalfCount <
              data.game.innings[inningsCount].halfs[halfCount].events.length;
              eventHalfCount++
            ) {
              if (
                data.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].lineup
              ) {
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/lineup`
                );
                await ref.set(
                  data.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].lineup
                );
              }
              if (
                data.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].at_bat
              ) {
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/description`
                );

                await ref.set(
                  data.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.description
                );
                if (eventHalfCount != eventHalfNow && changeEventHalf) {
                  eventAtbatNow = 0;
                  changeEventHalf = false;
                }
                for (
                  let eventAtbatCount = eventAtbatNow;
                  eventAtbatCount <
                  data.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.events.length;
                  eventAtbatCount++
                ) {
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/events${eventAtbatCount}`
                  );
                  await ref.set(
                    data.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount]
                  );
                }
              }
            }
          }
        }
      }

      //maybe call summary API
    } catch (error) {
      console.log(
        "error happened in pubsub/MLBpbpInplay function by page",
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
}

async function MLBpbpHistory(parameter) {
  const mlb_api_key = "qr8rjv3kzzdhdzzbx2rzx2h2";
  const firestoreName = "pagetest_MLB";
  let gameID = parameter.gameID;
  let betsID = parameter.betsID;
  const URL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  try {
    let { data } = await axios(URL);
    ref = modules.firestore.collection(firestoreName).doc(betsID);
    // eslint-disable-next-line no-await-in-loop
    await ref.set(
      {
        away_runs: data.game.scoring.away.runs,
        away_hits: data.game.scoring.away.hits,
        away_errors: data.game.scoring.away.errors,
        home_runs: data.game.scoring.home.runs,
        home_hits: data.game.scoring.home.hits,
        home_errors: data.game.scoring.home.errors
      },
      { merge: true }
    );

    for (
      let inningsCount = 0;
      inningsCount < data.game.innings.length;
      inningsCount++
    ) {
      for (
        let halfsCount = 0;
        halfsCount < data.game.innings[inningsCount].halfs.length;
        halfsCount++
      ) {
        for (
          let eventHalfCount = 0;
          eventHalfCount <
          data.game.innings[inningsCount].halfs[halfsCount].events.length;
          eventHalfCount++
        ) {
          if (
            data.game.innings[inningsCount].halfs[halfsCount].events[
              eventHalfCount
            ].lineup
          ) {
            ref = modules.firestore.collection(firestoreName).doc(betsID);
            await ref.set(jsonFile(), { merge: true });
          }
          if (
            data.game.innings[inningsCount].halfs[halfsCount].events[
              eventHalfCount
            ].at_bat
          ) {
            // ref = modules.database.ref(
            //   `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs${halfsCount}/events${eventHalfCount}/at_bat/description`
            // );
            // await ref.set(
            //   data.game.innings[inningsCount].halfs[halfsCount].events[
            //     eventHalfCount
            //   ].at_bat.description
            // );
            for (
              let eventAtbatCount = 0;
              eventAtbatCount <
              data.game.innings[inningsCount].halfs[halfsCount].events[
                eventHalfCount
              ].at_bat.events.length;
              eventAtbatCount++
            ) {
              // ref = modules.database.ref(
              //   `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs${halfsCount}/events${eventHalfCount}/at_bat/events${eventAtbatCount}`
              // );
              // await ref.set(
              //   data.game.innings[inningsCount].halfs[halfsCount].events[
              //     eventHalfCount
              //   ].at_bat.events[eventAtbatCount]
              // );
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(
      "error happened in pubsub/MLBpbpInplay function by page",
      error
    );
  }
  modules.firestore
    .collection(firestoreName)
    .doc(betsID)
    .set({ flag: { status: 0 } }, { merge: true });
}
function jsonFile() {
  let test = { pp: "123" };
  return test;
}
module.exports = { MLBpbpInplay, MLBpbpHistory };
