const modules = require('../util/modules');
const axios = require('axios');
const db = require('../util/dbUtil');
const transNBA = require('./translateNBA.js');
const translateNBA = transNBA.translateNBA;
const firestoreName = 'pagetest_NBA';
// const nba_api_key = 'y7uxzm4stjju6dmkspnabaav';
const nba_api_key = 'bj7tvgz7qpsqjqaxmzsaqdnp';
// const nba_api_key = '6mmty4jtxz3guuy62a4yr5u5';

// 14 秒一次
const perStep = 14000;
// 一分鐘4次
const timesPerLoop = 4;

async function NBApbpInplay(parameter) {
  const gameID = parameter.gameID;
  const betsID = parameter.betsID;
  const periodsNow = parameter.periodsNow;
  const eventsNow = parameter.eventsNow;

  if (periodsNow === 0 && eventsNow === 0) {
    await initRealtime(gameID, betsID);
  }

  let countForStatus2 = 0;
  const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  const summaryURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/summary.json?api_key=${nba_api_key}`;

  const realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database
        .ref(`basketball/NBA/${betsID}/Summary/info`)
        .once('value')
    )
  );
  const homeData = realtimeData.home;
  const awayData = realtimeData.away;
  const keywordHome = [];
  const keywordAway = [];
  const transSimpleHome = [];
  const transSimpleAway = [];

  for (let i = 0; i < Object.keys(homeData.lineup).length; i++) {
    await keywordHome.push(homeData.lineup[`lineup${i}`].name);
    await transSimpleHome.push(homeData.lineup[`lineup${i}`].transSimpleHome);
  }
  for (let i = 0; i < Object.keys(awayData.lineup).length; i++) {
    await keywordAway.push(awayData.lineup[`lineup${i}`].name);
    await transSimpleAway.push(awayData.lineup[`lineup${i}`].transSimpleAway);
  }
  const timerForStatus2 = setInterval(async function() {
    try {
      const parameterPBP = {
        periodsNow: periodsNow,
        eventsNow: eventsNow,
        pbpURL: pbpURL,
        betsID: betsID,
        homeData: homeData,
        awayData: awayData,
        keywordHome: keywordHome,
        transSimpleHome: transSimpleHome,
        keywordAway: keywordAway,
        transSimpleAway: transSimpleAway
      };
      const parameterSummary = { summaryURL: summaryURL, betsID: betsID };
      await doPBP(parameterPBP);
      await doSummary(parameterSummary);
    } catch (error) {
      console.log(
        'error happened in pubsub/NBApbpInplay function by page',
        error
      );
    }

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function summmaryZH(gameID) {
  const zhSummaryURL = `http://api.sportradar.us/nba/trial/v7/zh/games/${gameID}/summary.json?api_key=${nba_api_key}`;
  try {
    const keywordTransHome = [];
    const keywordTransAway = [];
    const { data } = await axios(zhSummaryURL);
    for (let i = 0; i < data.home.players.length; i++) {
      keywordTransHome.push(data.home.players[i].full_name);
    }
    for (let i = 0; i < data.away.players.length; i++) {
      keywordTransAway.push(data.away.players[i].full_name);
    }

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
    const keywordHome = [];
    const keywordAway = [];
    const numberHome = [];
    const numberAway = [];
    const { data } = await axios(enSummaryURL);
    const homeTeamName = data.home.name;
    const awayTeamName = data.away.name;
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
    console.log('error happened in pubsub/summmaryEN function by page', error);
    return error;
  }
}
async function NBApbpHistory(parameter) {
  const gameID = parameter.gameID;
  const betsID = parameter.betsID;
  const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  const enSummaryURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/summary.json?api_key=${nba_api_key}`;
  try {
    let { data } = await axios(pbpURL);
    const dataPBP = data;
    let ref = modules.firestore.collection(`${firestoreName}_PBP`).doc(betsID);

    for (
      let periodsCount = 0;
      periodsCount < dataPBP.periods.length;
      periodsCount++
    ) {
      for (
        let eventsCount = 0;
        eventsCount < dataPBP.periods[periodsCount].events.length;
        eventsCount++
      ) {
        ref = modules.firestore.collection(`${firestoreName}_PBP`).doc(betsID);
        // eslint-disable-next-line no-await-in-loop
        await ref.set(
          {
            pbp: {
              [`periods${periodsCount + 1}`]: {
                [`events${eventsCount}`]: dataPBP.periods[periodsCount].events[
                  eventsCount
                ]
              }
            }
          },
          { merge: true }
        );
      }
    }

    ({ data } = await axios(enSummaryURL));
    const dataSummary = data;
    for (let i = 0; i < dataSummary.home.players.length; i++) {
      ref = modules.firestore.collection(`${firestoreName}_PBP`).doc(betsID);
      // eslint-disable-next-line no-await-in-loop
      await ref.set(
        {
          players: {
            home: dataSummary.home.players[i],
            away: dataSummary.away.players[i]
          }
        },
        { merge: true }
      );
    }
    await modules.firestore
      .collection(firestoreName)
      .doc(betsID)
      .set({ flag: { status: 0 } }, { merge: true });
    await modules.database
      .ref(`basketball/NBA/${betsID}/Summary/statuts`)
      .set('closed');
    const Match = await db.Match.sync();
    await Match.upsert({
      bets_id: betsID,
      home_points: dataSummary.home.statistics.points,
      away_points: dataSummary.away.statistics.points,
      status: 0
    });
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpHistory function by page',
      error
    );
    return error;
  }
}
async function initRealtime(gameID, betsID) {
  let keywordTransHome = [];
  let keywordTransAway = [];
  let homeTeamName;
  let keywordHome = [];
  let numberHome = [];
  let awayTeamName;
  let keywordAway = [];
  let numberAway = [];
  try {
    // write to json
    // [主隊球員中文名字, 客隊球員中文名字]
    [keywordTransHome, keywordTransAway] = await summmaryZH(gameID);
    // [主隊英文名稱、主隊隊員英文名字、主隊隊員背號、客隊英文名稱、客隊隊員英文名字、客隊隊員背號]
    for (let i = 0; i < keywordTransHome.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      keywordTransHome[i] = await modules.simple2Tradition.translate(
        keywordTransHome[i]
      );
    }
    for (let i = 0; i < keywordTransHome.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      keywordTransAway[i] = await modules.simple2Tradition.translate(
        keywordTransAway[i]
      );
    }

    [
      homeTeamName,
      keywordHome,
      numberHome,
      awayTeamName,
      keywordAway,
      numberAway
    ] = await summmaryEN(gameID);
    const transSimpleHome = [];
    const transSimpleAway = [];
    // let transCompleteHome = [];
    // let transCompleteAway = [];
    let ref = modules.database.ref(
      `basketball/NBA/${betsID}/Summary/info/home/name`
    );
    await ref.set(homeTeamName);
    ref = modules.database.ref(
      `basketball/NBA/${betsID}/Summary/info/away/name`
    );
    await ref.set(awayTeamName);

    for (let i = 0; i < keywordHome.length; i++) {
      transSimpleHome[i] = `${keywordHome[i]}(#${numberHome[i]})`;
      // transCompleteHome[
      //   i
      // ] = `[${homeTeamName}] ${keywordTransHome[i]}(${keywordHome[i]}#${numberHome[i]})`;
      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}`
      );
      await ref.set({
        name: keywordHome[i],
        name_ch: keywordTransHome[i],
        jersey_number: numberHome[i],
        transSimpleHome: transSimpleHome[i]
      });
    }
    for (let i = 0; i < keywordAway.length; i++) {
      transSimpleAway[i] = `${keywordAway[i]}(#${numberAway[i]})`;
      // transCompleteAway[
      //   i
      // ] = `[${awayTeamName}] ${keywordTransAway[i]}(${keywordAway[i]}#${numberAway[i]})`;
      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}`
      );
      await ref.set({
        name: keywordAway[i],
        name_ch: keywordTransAway[i],
        jersey_number: numberAway[i],
        transSimpleAway: transSimpleAway[i]
      });
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpInplay function by page',
      error
    );
  }
}
async function doPBP(parameter) {
  const betsID = parameter.betsID;
  let periodsNow = parameter.periodsNow;
  let eventsNow = parameter.eventsNow;
  const pbpURL = parameter.pbpURL;
  const homeData = parameter.homeData;
  const awayData = parameter.awayData;
  const keywordHome = parameter.keywordHome;
  const transSimpleHome = parameter.transSimpleHome;
  const keywordAway = parameter.keywordAway;
  const transSimpleAway = parameter.transSimpleAway;
  const { data } = await axios(pbpURL);
  const dataPBP = data;

  for (
    let periodsCount = periodsNow;
    periodsCount < dataPBP.periods.length;
    periodsCount++
  ) {
    if (periodsCount !== periodsNow) {
      periodsNow = periodsNow + 1;
      eventsNow = 0;
    }
    for (
      let eventsCount = eventsNow;
      eventsCount < dataPBP.periods[periodsCount].events.length;
      eventsCount++
    ) {
      if (eventsCount !== eventsNow) {
        eventsNow = eventsNow + 1;
      }

      const descCH = await translateNBA(
        dataPBP.periods[periodsCount].events[eventsCount].description,
        keywordHome,
        keywordAway,
        transSimpleHome,
        transSimpleAway
        // transCompleteHome,
        // transCompleteAway
      );

      let ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/periods${
          periodsCount + 1
        }/events${eventsCount}/description`
      );
      await ref.set(
        dataPBP.periods[periodsCount].events[eventsCount].description
      );
      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/periods${
          periodsCount + 1
        }/events${eventsCount}/description_ch`
      );
      await ref.set(descCH);
      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/periods${
          periodsCount + 1
        }/events${eventsCount}/clock`
      );
      await ref.set(dataPBP.periods[periodsCount].events[eventsCount].clock);
      if (
        dataPBP.periods[periodsCount].events[eventsCount].event_type !==
          'review' &&
        dataPBP.periods[periodsCount].events[eventsCount].event_type !==
          'stoppage' &&
        dataPBP.periods[periodsCount].events[eventsCount].event_type !==
          'endperiod'
      ) {
        const ref = modules.database.ref(
          `basketball/NBA/${betsID}/Summary/periods${
            periodsCount + 1
          }/events${eventsCount}/attribution`
        );
        if (
          dataPBP.periods[periodsCount].events[eventsCount].attribution.name ===
          homeData.name
        ) {
          await ref.set('home');
        }
        if (
          dataPBP.periods[periodsCount].events[eventsCount].attribution.name ===
          awayData.name
        ) {
          await ref.set('away');
        }
      } else if (
        dataPBP.periods[periodsCount].events[eventsCount].event_type ===
        'stoppage'
      ) {
        const ref = modules.database.ref(
          `basketball/NBA/${betsID}/Summary/periods${
            periodsCount + 1
          }/events${eventsCount}/attribution`
        );
        await ref.set('home');
      } else {
        const ref = modules.database.ref(
          `basketball/NBA/${betsID}/Summary/periods${
            periodsCount + 1
          }/events${eventsCount}/attribution`
        );
        await ref.set('common');
      }
      ref = modules.database.ref(`basketball/NBA/${betsID}/Summary/Now_clock`);
      await ref.set(dataPBP.periods[periodsCount].events[eventsCount].clock);
      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/Now_periods`
      );
      await ref.set(periodsCount + 1);

      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/info/home/periods${
          periodsCount + 1
        }/points`
      );
      await ref.set(dataPBP.periods[periodsCount].scoring.home.points);
      ref = modules.database.ref(
        `basketball/NBA/${betsID}/Summary/info/away/periods${
          periodsCount + 1
        }/points`
      );
      await ref.set(dataPBP.periods[periodsCount].scoring.away.points);
    }
  }

  if (dataPBP.status !== 'inprogress') {
    await modules.database
      .ref(`basketball/NBA/${betsID}/Summary/status`)
      .set('closed');
  } else {
    await modules.firestore
      .collection(firestoreName)
      .doc(betsID)
      .set({ flag: { status: 1 } }, { merge: true });
    await modules.database
      .ref(`basketball/NBA/${betsID}/Summary/status`)
      .set('inprogress');
    const Match = await db.Match.sync();
    await Match.upsert({
      bets_id: betsID,
      status: 1
    });
  }
}
async function doSummary(parameter) {
  const betsID = parameter.betsID;
  const summaryURL = parameter.summaryURL;
  const { data } = await axios(summaryURL);
  const dataSummary = data;

  let ref = modules.database.ref(
    `basketball/NBA/${betsID}/Summary/info/home/Total`
  );
  await ref.set({
    assists: dataSummary.home.statistics.assists,
    blocks: dataSummary.home.statistics.blocks,
    free_throws_att: dataSummary.home.statistics.free_throws_att,
    free_throws_made: dataSummary.home.statistics.free_throws_made,
    personal_fouls: dataSummary.home.statistics.personal_fouls,
    points_in_paint: dataSummary.home.statistics.points_in_paint,
    rebounds: dataSummary.home.statistics.rebounds,
    points: dataSummary.home.statistics.points,
    steals: dataSummary.home.statistics.steals,
    three_points_att: dataSummary.home.statistics.three_points_att,
    three_points_made: dataSummary.home.statistics.three_points_made,
    turnovers: dataSummary.home.statistics.turnovers,
    two_points_att: dataSummary.home.statistics.two_points_att,
    two_points_made: dataSummary.home.statistics.two_points_made
  });
  ref = modules.database.ref(
    `basketball/NBA/${betsID}/Summary/info/away/Total`
  );

  await ref.set({
    assists: dataSummary.away.statistics.assists,
    blocks: dataSummary.away.statistics.blocks,
    free_throws_att: dataSummary.away.statistics.free_throws_att,
    free_throws_made: dataSummary.away.statistics.free_throws_made,
    personal_fouls: dataSummary.away.statistics.personal_fouls,
    points_in_paint: dataSummary.away.statistics.points_in_paint,
    rebounds: dataSummary.away.statistics.rebounds,
    points: dataSummary.away.statistics.points,
    steals: dataSummary.away.statistics.steals,
    three_points_att: dataSummary.away.statistics.three_points_att,
    three_points_made: dataSummary.away.statistics.three_points_made,
    turnovers: dataSummary.away.statistics.turnovers,
    two_points_att: dataSummary.away.statistics.two_points_att,
    two_points_made: dataSummary.away.statistics.two_points_made
  });
  for (let i = 0; i < dataSummary.home.players.length; i++) {
    ref = modules.database.ref(
      `basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}/starter`
    );
    if (dataSummary.home.players[i].starter !== undefined) {
      await ref.set(dataSummary.home.players[i].primary_position);
    } else {
      await ref.set('0');
    }
    ref = modules.database.ref(
      `basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}/statistics`
    );
    await ref.set({
      minutes: dataSummary.home.players[i].statistics.minutes,
      points: dataSummary.home.players[i].statistics.points,
      rebounds: dataSummary.home.players[i].statistics.rebounds,
      assists: dataSummary.home.players[i].statistics.assists
    });
  }
  for (let i = 0; i < dataSummary.away.players.length; i++) {
    ref = modules.database.ref(
      `basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}/starter`
    );
    if (dataSummary.away.players[i].starter !== undefined) {
      await ref.set(dataSummary.away.players[i].primary_position);
    } else {
      await ref.set('0');
    }
    ref = modules.database.ref(
      `basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}/statistics`
    );
    await ref.set({
      minutes: dataSummary.away.players[i].statistics.minutes,
      points: dataSummary.away.players[i].statistics.points,
      rebounds: dataSummary.away.players[i].statistics.rebounds,
      assists: dataSummary.away.players[i].statistics.assists
    });
  }
}
module.exports = { NBApbpInplay, NBApbpHistory };
