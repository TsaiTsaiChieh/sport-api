const modules = require('../util/modules');
const axios = require('axios');

const firestoreName = 'pagetest';
//const nba_api_key = "y7uxzm4stjju6dmkspnabaav";
// const nba_api_key = 'bj7tvgz7qpsqjqaxmzsaqdnp';
const nba_api_key = '6mmty4jtxz3guuy62a4yr5u5';

// 14 秒一次
const perStep = 14000;
//一分鐘4次
const timesPerLoop = 4;
function test() {
  let gameID = '380142e6-95e7-423b-8ba9-4de32862fd06';
  let betsID = '1111111';
  let periodsNow = 0;
  let eventsNow = 0;
  NBApbpInplay(gameID, betsID, periodsNow, eventsNow);
}
test();
async function NBApbpInplay(gameID, betsID, periodsNow, eventsNow) {
  if (periodsNow === 0 && eventsNow == 0) {
    try {
      // write to json
      let keywordTransHome = [];
      let keywordTransAway = [];
      [keywordTransHome, keywordTransAway] = await summmaryZH(gameID);

      let homeTeamName;
      let keywordHome = [];
      let numberHome = [];
      let awayTeamName;
      let keywordAway = [];
      let numberAway = [];

      [
        homeTeamName,
        keywordHome,
        numberHome,
        awayTeamName,
        keywordAway,
        numberAway
      ] = await summmaryEN(gameID);
      let transSimpleHome = [];
      let transSimpleAway = [];
      let transCompleteHome = [];
      let transCompleteAway = [];

      for (let i = 0; i < keywordTransHome.length; i++) {
        transSimpleHome[i] = `${keywordTransHome[i]}#${numberHome[i]}`;
        transCompleteHome[
          i
        ] = `[${homeTeamName}] ${keywordTransHome[i]}(${keywordHome[i]}#${numberHome[i]})`;
      }
      for (let i = 0; i < keywordTransAway.length; i++) {
        transSimpleAway[i] = `${keywordTransAway[i]}#${numberAway[i]}`;
        transCompleteAway[
          i
        ] = `[${awayTeamName}] ${keywordTransAway[i]}(${keywordAway[i]}#${numberAway[i]})`;
      }
      //keywordHome,keywordAway
      //transSimpleHome,transSimpleAway
      //transCompleteHome,transCompleteAway

      modules.fs.writeFile(
        `./${betsID}.json`,
        JSON.stringify({
          keywordHome: keywordHome,
          keywordAway: keywordAway,
          transSimpleHome: transSimpleHome,
          transSimpleAway: transSimpleAway,
          transCompleteHome: transCompleteHome,
          transCompleteAway: transCompleteAway
        }),
        function(error) {
          console.log('write file error in pbpNBA.js');
        }
      );
    } catch (error) {
      console.log(
        'error happened in pubsub/NBApbpInplay function by page',
        error
      );
    }
  }

  modules.fs.readFile(`${betsid}.json`, function(err, data) {
    if (err) throw err;
    //read data
  });
  let countForStatus2 = 0;
  const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;

  let changePeriods = true;
  let timerForStatus2 = setInterval(async function() {
    try {
      let { data } = await axios(pbpURL);
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
          // let descCH=translateNBA(keywordHome,
          // keywordAway,
          // transSimpleHome,
          // transSimpleAway,
          // transCompleteHome,
          // transCompleteAway)

          // write to realtime database
        }
      }
      //call summary to get player information
      //scores, blocks, assists, minutes
      ref = modules.database.ref(`basketball/NBA/${betsID}/Summary/homepoints`);
      await ref.set(data.home.points);
      ref = modules.database.ref(`basketball/NBA/${betsID}/Summary/awaypoints`);
      await ref.set(data.away.points);
    } catch (error) {
      console.log(
        'error happened in pubsub/NBApbpInplay function by page',
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
  }, perStep);
  // change the status to 1
}
async function summmaryZH(gameID) {
  const zhSummaryURL = `http://api.sportradar.us/nba/trial/v7/zh/games/${gameID}/summary.json?api_key=${nba_api_key}`;
  try {
    let keywordTransHome = [];
    let keywordTransAway = [];
    let { data } = await axios(zhSummaryURL);
    for (let i = 0; i < data.home.players.length; i++) {
      keywordTransHome.push(data.home.players[i].full_name);
    }
    for (let i = 0; i < data.away.players.length; i++) {
      keywordTransAway.push(data.away.players[i].full_name);
    }
    // [ ] or { }
    return [keywordTransHome, keywordTransAway];
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpInplay function by page',
      error
    );
    return error;
  }
}
async function summmaryEN(gameID) {
  const enSummaryURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/summary.json?api_key=${nba_api_key}`;
  try {
    let homeTeamName;
    let awayTeamName;
    let keywordHome = [];
    let keywordAway = [];
    let numberHome = [];
    let numberAway = [];
    let { data } = await axios(enSummaryURL);
    homeTeamName = data.home.name;
    awayTeamName = data.away.name;
    for (let i = 0; i < data.home.players.length; i++) {
      keywordHome.push(data.home.players[i].full_name);
      numberHome.push(data.home.players[i].jersey_number);
    }
    for (let i = 0; i < data.away.players.length; i++) {
      keywordAway.push(data.away.players[i].full_name);
      numberAway.push(data.away.players[i].jersey_number);
    }
    return [
      homeTeamName,
      keywordHome,
      numberHome,
      awayTeamName,
      keywordAway,
      numberAway
    ];
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpHistory function by page',
      error
    );
    return error;
  }
}
async function NBApbpHistory(gameID, betsID) {
  const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  try {
    let { data } = await axios(pbpURL);

    let winner;
    if (data.home.points > data.away.points) {
      winner = 'home';
    } else {
      winner = 'away';
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
        await ref.set(
          { pbp: data.periods[periodsCount].events[eventsCount] },
          { merge: true }
        );
      }
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpHistory function by page',
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
