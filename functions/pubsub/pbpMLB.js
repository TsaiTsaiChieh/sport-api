const modules = require('../util/modules');
const axios = require('axios');
const transMLB = require('./translateMLB');
const translateMLB = transMLB.translateMLB;
const firestoreName = 'page_MLB';
const mlb_api_key = 'x6t9jymf2hdy8nqy2ayk69db';
// const mlb_api_key = 's7bs62gb8ye8ram6ksr7rkec';
const baseNow = [];
// 清空壘包
baseNow[0] = 0;
baseNow[1] = 0;
baseNow[2] = 0;
// 14 秒一次
const perStep = 14000;
// 一分鐘4次
const timesPerLoop = 4;
async function MLBpbpInplay(parameter) {
  const gameID = parameter.gameID;
  const betsID = parameter.betsID;
  let inningsNow = parameter.inningsNow;
  let halfNow = parameter.halfNow;
  let eventHalfNow = parameter.eventHalfNow;
  let eventAtbatNow = parameter.eventAtbatNow;

  if (
    inningsNow === 0 &&
    halfNow === 0 &&
    eventHalfNow === 0 &&
    eventAtbatNow === 0
  ) {
    let keywordTransHome = [];
    let keywordTransAway = [];
    let homeTeamName;
    let keywordHome = [];
    let numberHome = [];
    let awayTeamName;
    let keywordAway = [];
    let numberAway = [];
    try {
      [
        homeTeamName,
        keywordHome,
        numberHome,
        awayTeamName,
        keywordAway,
        numberAway,
      ] = await summmaryEN(gameID);
      keywordTransHome = await transFunction(keywordHome);
      keywordTransAway = await transFunction(keywordAway);
      const transSimpleHome = [];
      const transSimpleAway = [];
      // let transCompleteHome = [];
      // let transCompleteAway = [];
      let ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/info/home/name`
      );
      await ref.set(homeTeamName);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/info/away/name`
      );
      await ref.set(awayTeamName);
      for (let i = 0; i < keywordHome.length; i++) {
        transSimpleHome[i] = `${keywordHome[i]}(#${numberHome[i]})`;
        // transCompleteHome[
        //   i
        // ] = `[${homeTeamName}] ${keywordHome[i]}(${keywordHome[i]}#${numberHome[i]})`;
        ref = modules.database.ref(
          `baseball/MLB/${betsID}/Summary/info/home/roster/lineup${numberHome[i]}`
        );
        await ref.set({
          name: keywordHome[i],
          name_ch: keywordTransHome[i],
          jersey_number: numberHome[i],
          transSimpleHome: transSimpleHome[i],
          ab: 0,
          h: 0,
          ip: 0,
          strikes: 0,
          balls: 0,
          er: 0,
          h: 0,
          k: 0,
          play: 0,
        });
      }
      for (let i = 0; i < keywordAway.length; i++) {
        transSimpleAway[i] = `${keywordAway[i]}(#${numberAway[i]})`;
        // transCompleteAway[
        //   i
        // ] = `[${awayTeamName}] ${keywordAway[i]}(${keywordAway[i]}#${numberAway[i]})`;
        ref = modules.database.ref(
          `baseball/MLB/${betsID}/Summary/info/away/roster/lineup${numberAway[i]}`
        );
        await ref.set({
          name: keywordAway[i],
          name_ch: keywordTransAway[i],
          jersey_number: numberAway[i],
          transSimpleAway: transSimpleAway[i],
          ab: 0,
          h: 0,
          ip: 0,
          strikes: 0,
          balls: 0,
          er: 0,
          h: 0,
          k: 0,
          play: 0,
        });
      }
    } catch (error) {
      console.log(
        'error happened in pubsub/MLBpbpInplay function by page',
        error
      );
    }
  }

  let countForStatus2 = 0;
  const pbpURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  const summaryURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/summary.json?api_key=${mlb_api_key}`;
  let inningsCount;
  let numberCount;
  let halfCount;
  let eventHalfCount;
  let eventAtbatCount;
  let totalDescriptionOrEachBall;
  const realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database
        .ref(`baseball/MLB/${betsID}/Summary/info`)
        .once('value')
    )
  );
  const homeData = realtimeData.home;
  const awayData = realtimeData.away;
  const keywordHome = [];
  const keywordAway = [];
  const transSimpleHome = [];
  const transSimpleAway = [];
  for (let i = 0; i < Object.keys(homeData.roster).length; i++) {
    await keywordHome.push(
      homeData.roster[Object.keys(homeData.roster)[i]].name
    );
    await transSimpleHome.push(
      homeData.roster[Object.keys(homeData.roster)[i]].transSimpleHome
    );
  }
  for (let i = 0; i < Object.keys(awayData.roster).length; i++) {
    await keywordAway.push(
      awayData.roster[Object.keys(awayData.roster)[i]].name
    );
    await transSimpleAway.push(
      awayData.roster[Object.keys(awayData.roster)[i]].transSimpleAway
    );
  }
  const timerForStatus2 = setInterval(async function () {
    try {
      // 目前的總比分
      let { data } = await axios(pbpURL);
      let dataPBP = data;

      let ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/status`);
      await ref.set(dataPBP.game.status);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/info/home/Total`
      );
      await ref.set({
        runs: dataPBP.game.scoring.home.runs,
        hits: dataPBP.game.scoring.home.hits,
        errors: dataPBP.game.scoring.home.errors,
      });
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/info/away/Total`
      );
      await ref.set({
        runs: dataPBP.game.scoring.away.runs,
        hits: dataPBP.game.scoring.away.hits,
        errors: dataPBP.game.scoring.away.errors,
      });

      for (
        inningsCount = inningsNow;
        inningsCount < dataPBP.game.innings.length;
        inningsCount++
      ) {
        ref = modules.database.ref(
          `baseball/MLB/${betsID}/Summary/Now_innings`
        );
        await ref.set(inningsCount);

        // lineup
        if (inningsCount === 0) {
          const awayLineupLength =
            dataPBP.game.innings[0].halfs[0].events.length;
          const homeLineupLength =
            dataPBP.game.innings[0].halfs[1].events.length;
          for (numberCount = 0; numberCount < homeLineupLength; numberCount++) {
            // write hometeam lineup
            const order =
              dataPBP.game.innings[0].halfs[1].events[numberCount].lineup.order;
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/Summary/info/home/Now_lineup/lineup${order}`
            );

            await ref.set({
              player_id:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .player_id,
              order:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .order,
              position:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .position,
              preferred_name:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .preferred_name,
              first_name:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .first_name,
              last_name:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .last_name,
              jersey_number:
                dataPBP.game.innings[0].halfs[1].events[numberCount].lineup
                  .jersey_number,
              ab: 0,
              h: 0,
            });
          }
          for (numberCount = 0; numberCount < awayLineupLength; numberCount++) {
            // write awayteam lineup
            const order =
              dataPBP.game.innings[0].halfs[0].events[numberCount].lineup.order;
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/Summary/info/away/Now_lineup/lineup${order}`
            );

            await ref.set({
              player_id:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .player_id,
              order:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .order,
              position:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .position,
              preferred_name:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .preferred_name,
              first_name:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .first_name,
              last_name:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .last_name,
              jersey_number:
                dataPBP.game.innings[0].halfs[0].events[numberCount].lineup
                  .jersey_number,
              ab: 0,
              h: 0,
            });
          }
          inningsNow = inningsNow + 1;
        }
        if (inningsCount >= 1) {
          // normal play
          if (inningsCount !== inningsNow) {
            inningsNow = inningsNow + 1;
            halfNow = 0;
            eventHalfNow = 0;
            eventAtbatNow = 0;
            baseNow[0] = 0;
            baseNow[1] = 0;
            baseNow[2] = 0;
          }

          for (
            halfCount = halfNow;
            halfCount < dataPBP.game.innings[inningsCount].halfs.length;
            halfCount++
          ) {
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/Summary/Now_halfs`
            );
            await ref.set(halfCount);
            if (halfCount !== halfNow) {
              halfNow = halfNow + 1;
              eventHalfNow = 0;
              eventAtbatNow = 0;
              baseNow[0] = 0;
              baseNow[1] = 0;
              baseNow[2] = 0;
            }

            for (
              eventHalfCount = eventHalfNow;
              eventHalfCount <
              dataPBP.game.innings[inningsCount].halfs[halfCount].events.length;
              eventHalfCount++
            ) {
              if (halfCount === 0) {
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/info/away/Innings${inningsCount}/scoring`
                );
                await ref.set({
                  runs: dataPBP.game.innings[inningsCount].scoring.away.runs,
                  errors:
                    dataPBP.game.innings[inningsCount].scoring.away.errors,
                  hits: dataPBP.game.innings[inningsCount].scoring.away.hits,
                });
              }
              if (halfCount === 1) {
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/info/home/Innings${inningsCount}/scoring`
                );
                await ref.set({
                  runs: dataPBP.game.innings[inningsCount].scoring.home.runs,
                  errors:
                    dataPBP.game.innings[inningsCount].scoring.home.errors,
                  hits: dataPBP.game.innings[inningsCount].scoring.home.hits,
                });
              }
              if (
                dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].lineup
              ) {
                eventAtbatNow = 0;
                if (halfCount === 0) {
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/info/away/Now_lineup/lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].lineup.order}`
                  );
                  await ref.set({
                    preferred_name:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.preferred_name,
                    first_name:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.first_name,
                    last_name:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.last_name,
                    jersey_number:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.jersey_number,
                    player_id:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.player_id,
                    position:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.position,
                  });
                } else {
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/info/home/Now_lineup/lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].lineup.order}`
                  );
                  await ref.set({
                    preferred_name:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.preferred_name,
                    first_name:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.first_name,
                    last_name:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.last_name,
                    jersey_number:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.jersey_number,
                    player_id:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.player_id,
                    position:
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.position,
                  });
                }

                totalDescriptionOrEachBall = 0;
                const descCH = await translateMLB(
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].lineup.description,
                  keywordHome,
                  keywordAway,
                  transSimpleHome,
                  transSimpleAway,
                  totalDescriptionOrEachBall
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/lineup/description`
                );
                await ref.set(
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].lineup.description
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/lineup/description_ch`
                );
                await ref.set(descCH);
              }

              if (
                dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].at_bat
              ) {
                let pitcherInfo = {};
                if (halfCount == 0) {
                  pitcherInfo.ip =
                    homeData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].ip;
                  pitcherInfo.strikes =
                    homeData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].strikes;
                  pitcherInfo.balls =
                    homeData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].balls;
                  pitcherInfo.er =
                    homeData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].er;
                  pitcherInfo.h =
                    homeData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].h;
                  pitcherInfo.k =
                    homeData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].k;
                }
                if (halfCount == 1) {
                  pitcherInfo.ip =
                    awayData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].ip;
                  pitcherInfo.strikes =
                    awayData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].strikes;
                  pitcherInfo.balls =
                    awayData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].balls;
                  pitcherInfo.er =
                    awayData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].er;
                  pitcherInfo.h =
                    awayData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].h;
                  pitcherInfo.k =
                    awayData.roster[
                      `lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].at_bat.pitcher.jersey_number}`
                    ].k;
                }
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/Now_pitcher`
                );
                await ref.set({
                  first_name:
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.pitcher.first_name,
                  last_name:
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.pitcher.last_name,
                  jersey_number:
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.pitcher.jersey_number,
                  id:
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.pitcher.id,
                  ip: pitcherInfo.ip,
                  strikes: pitcherInfo.strikes,
                  balls: pitcherInfo.balls,
                  er: pitcherInfo.er,
                  h: pitcherInfo.h,
                  k: pitcherInfo.k,

                  //here
                });
                let hitterID =
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.hitter_id;
                let realtimeData;
                if (halfCount == 0) {
                  realtimeData = JSON.parse(
                    JSON.stringify(
                      // eslint-disable-next-line no-await-in-loop
                      await modules.database
                        .ref(`baseball/MLB/${betsID}/Summary/info/away`)
                        .once('value')
                    )
                  );
                } else {
                  realtimeData = JSON.parse(
                    JSON.stringify(
                      // eslint-disable-next-line no-await-in-loop
                      await modules.database
                        .ref(`baseball/MLB/${betsID}/Summary/info/home`)
                        .once('value')
                    )
                  );
                }
                for (let i = 1; i < 10; i++) {
                  if (
                    hitterID == realtimeData.Now_lineup[`lineup${i}`].player_id
                  ) {
                    let count1 = i % 9;
                    if (count1 == 0) {
                      count = 9;
                    }
                    let count2 = (i + 1) % 9;
                    if (count2 == 0) {
                      count2 = 9;
                    }
                    let count3 = (i + 2) % 9;
                    if (count3 == 0) {
                      count3 = 9;
                    }
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Now_order`
                    );
                    await ref.set(
                      realtimeData.Now_lineup[`lineup${count1}`].order
                    );
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Now_hitter`
                    );
                    await ref.set(realtimeData.Now_lineup[`lineup${count1}`]);
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Now_hitter/ab`
                    );
                    await ref.set(
                      realtimeData.roster[
                        `lineup${
                          realtimeData.Now_lineup[`lineup${count1}`]
                            .jersey_number
                        }`
                      ].ab
                    );
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Now_hitter/h`
                    );
                    await ref.set(
                      realtimeData.roster[
                        `lineup${
                          realtimeData.Now_lineup[`lineup${count1}`]
                            .jersey_number
                        }`
                      ].h
                    );
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Next1_hitter`
                    );
                    await ref.set(realtimeData.Now_lineup[`lineup${count2}`]);
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Next1_hitter/ab`
                    );
                    await ref.set(
                      realtimeData.roster[
                        `lineup${
                          realtimeData.Now_lineup[`lineup${count2}`]
                            .jersey_number
                        }`
                      ].ab
                    );
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Next1_hitter/h`
                    );
                    await ref.set(
                      realtimeData.roster[
                        `lineup${
                          realtimeData.Now_lineup[`lineup${count2}`]
                            .jersey_number
                        }`
                      ].h
                    );

                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Next2_hitter`
                    );
                    await ref.set(realtimeData.Now_lineup[`lineup${count3}`]);
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Next2_hitter/ab`
                    );
                    await ref.set(
                      realtimeData.roster[
                        `lineup${
                          realtimeData.Now_lineup[`lineup${count3}`]
                            .jersey_number
                        }`
                      ].ab
                    );
                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Next2_hitter/h`
                    );
                    await ref.set(
                      realtimeData.roster[
                        `lineup${
                          realtimeData.Now_lineup[`lineup${count3}`]
                            .jersey_number
                        }`
                      ].h
                    );
                    break;
                  }
                }

                if (
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.description
                ) {
                  totalDescriptionOrEachBall = 0;
                  const desResultCH = await translateMLB(
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.description,
                    keywordHome,
                    keywordAway,
                    transSimpleHome,
                    transSimpleAway,
                    // transCompleteHome,
                    // transCompleteAway,
                    totalDescriptionOrEachBall
                  );
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/description`
                  );
                  await ref.set(
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.description
                  );
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/description_ch`
                  );
                  await ref.set(desResultCH);
                }
                if (eventHalfCount !== eventHalfNow) {
                  eventHalfNow = eventHalfNow + 1;
                  eventAtbatNow = 0;
                }
                for (
                  eventAtbatCount = eventAtbatNow;
                  eventAtbatCount <
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.events.length;
                  eventAtbatCount++
                ) {
                  if (
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].flags.is_ab_over === false
                  ) {
                    totalDescriptionOrEachBall = 1;
                    const out = [];
                    out.push(
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].at_bat.events[eventAtbatCount]
                        .pitcher.first_name +
                        ' ' +
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .pitcher.last_name +
                        '(#' +
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .pitcher.jersey_number +
                        ')'
                    );
                    out.push(
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].at_bat.events[eventAtbatCount]
                        .hitter.first_name +
                        ' ' +
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .hitter.last_name +
                        '(#' +
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .hitter.jersey_number +
                        ')'
                    );
                    out.push(
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].at_bat.events[eventAtbatCount]
                        .outcome_id
                    );
                    const desResultCH = await translateMLB(
                      out,
                      out[0],
                      out[1],
                      transSimpleHome,
                      transSimpleAway,
                      // transCompleteHome,
                      // transCompleteAway,
                      totalDescriptionOrEachBall
                    );

                    ref = modules.database.ref(
                      `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/events${eventAtbatCount}`
                    );
                    await ref.set({
                      description:
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .outcome_id,
                      description_ch: desResultCH,
                    });
                  }

                  // 球數
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_strikes`
                  );
                  await ref.set(
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].count.strikes
                  );
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_balls`
                  );
                  await ref.set(
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].count.balls
                  );
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_outs`
                  );
                  await ref.set(
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].count.outs
                  );

                  if (
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].runners
                  ) {
                    const baseInformation =
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].at_bat.events[eventAtbatCount]
                        .runners.length;
                    for (
                      let baseCount = 0;
                      baseCount < baseInformation;
                      baseCount++
                    ) {
                      // 壘包資訊
                      const startBase =
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .runners[baseCount].starting_base;
                      const endBase =
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .runners[baseCount].ending_base;
                      if (endBase === 0) {
                        // 壘上出局
                        baseNow[startBase - 1] = 0;
                      } else if (endBase === 4) {
                        // 回本壘
                        baseNow[startBase - 1] = 0;
                      } else {
                        baseNow[startBase - 1] = 0;
                        baseNow[endBase - 1] = 1;
                      }
                    }
                  }
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_firstbase`
                  );
                  await ref.set(baseNow[0]);
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_secondbase`
                  );
                  await ref.set(baseNow[1]);
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_thirdbase`
                  );
                  await ref.set(baseNow[2]);
                }
              }
            }
          }
        }
      }
      ({ data } = await axios(summaryURL));
      let dataSummary = data;
      //call summary
      for (let i = 0; i < dataSummary.game.home.players.length; i++) {
        let number = dataSummary.game.home.players[i].jersey_number;

        ref = modules.database.ref(
          `baseball/MLB/${betsID}/Summary/info/home/roster/lineup${number}/performance`
        );
        if (dataSummary.game.home.players[i].position == 'P') {
          await ref.set({
            ab: null,
            h: null,
            ip: dataSummary.game.home.players[i].pitching.ip_2,
            strikes:
              dataSummary.game.home.players[i].pitching.pitches.count -
              dataSummary.game.home.players[i].pitching.pitches.btotal,
            balls: dataSummary.game.home.players[i].pitching.pitches.btotal,
            er:
              (dataSummary.game.home.players[i].pitching.era *
                dataSummary.game.home.players[i].pitching.ip_2) /
              9,
            h: dataSummary.game.home.players[i].pitching.onbase.h,
            k: dataSummary.game.home.players[i].pitching.outs.ktotal,
            play: 1,
          });
        } else {
          await ref.set({
            ab: dataSummary.game.home.players[i].hitting.overall.ab,
            h: dataSummary.game.home.players[i].hitting.onbase.h,
            ip: null,
            strikes: null,
            balls: null,
            er: null,
            h: null,
            k: null,
            play: 1,
          });
        }
      }
      for (let i = 0; i < dataSummary.game.away.players.length; i++) {
        let number = dataSummary.game.away.players[i].jersey_number;

        ref = modules.database.ref(
          `baseball/MLB/${betsID}/Summary/info/away/roster/lineup${number}/performance`
        );
        if (dataSummary.game.home.players[i].position == 'P') {
          await ref.set({
            ab: null,
            h: null,
            ip: dataSummary.game.away.players[i].pitching.ip_2,
            strikes:
              dataSummary.game.away.players[i].pitching.pitches.count -
              dataSummary.game.away.players[i].pitching.pitches.btotal,
            balls: dataSummary.game.away.players[i].pitching.pitches.btotal,
            er:
              (dataSummary.game.away.players[i].pitching.era *
                dataSummary.game.away.players[i].pitching.ip_2) /
              9,
            h: dataSummary.game.away.players[i].pitching.onbase.h,
            k: dataSummary.game.away.players[i].pitching.outs.ktotal,
            play: 1,
          });
        } else {
          await ref.set({
            ab: dataSummary.game.away.players[i].hitting.overall.ab,
            h: dataSummary.game.away.players[i].hitting.onbase.h,
            ip: null,
            strikes: null,
            balls: null,
            er: null,
            h: null,
            k: null,
            play: 1,
          });
        }
      }

      if (
        dataPBP.game.status !== 'inprogress' ||
        dataPBP.game.status !== 'complete'
      ) {
        modules.firestore
          .collection(firestoreName)
          .doc(betsID)
          .set({ flag: { status: 0 } }, { merge: true });
        clearInterval(timerForStatus2);
      }
      // add here for any status
      // maybe call summary API for player information
    } catch (error) {
      console.log(
        'error happened in pubsub/MLBpbpInplay function by page',
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
}

async function MLBpbpHistory(parameter) {
  const gameID = parameter.gameID;
  const betsID = parameter.betsID;
  const gameTime = parameter.scheduled;
  const pbpURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  try {
    const { data } = await axios(pbpURL);
    const dataPBP = data;
    const ref = await modules.firestore
      .collection(`${firestoreName}_PBP`)
      .doc(betsID);
    await ref.set(
      {
        bets_id: betsID,
        radar_id: gameID,
        scheduled: gameTime,
        home: {
          home_runs: dataPBP.game.scoring.home.runs,
          home_hits: dataPBP.game.scoring.home.hits,
          home_errors: dataPBP.game.scoring.home.errors,
        },
        away: {
          away_runs: dataPBP.game.scoring.away.runs,
          away_hits: dataPBP.game.scoring.away.hits,
          away_errors: dataPBP.game.scoring.away.errors,
        },
      },
      { merge: true }
    );
    // pbp
    for (
      let inningsCount = 0;
      inningsCount < dataPBP.game.innings.length;
      inningsCount++
    ) {
      if (inningsCount === 0) {
        for (let i = 0; i < 10; i++) {
          await ref.set(
            {
              PBP: {
                innings0: {
                  halfs0: {
                    ['lineup' + i]: dataPBP.game.innings[0].halfs[0].events[i],
                  },
                },
              },
            },
            { merge: true }
          );
          await ref.set(
            {
              PBP: {
                innings0: {
                  halfs1: {
                    ['lineup' + i]: dataPBP.game.innings[0].halfs[1].events[i],
                  },
                },
              },
            },
            { merge: true }
          );
        }
      } else {
        for (
          let halfsCount = 0;
          halfsCount < dataPBP.game.innings[inningsCount].halfs.length;
          halfsCount++
        ) {
          for (
            let eventHalfCount = 0;
            eventHalfCount <
            dataPBP.game.innings[inningsCount].halfs[halfsCount].events.length;
            eventHalfCount++
          ) {
            if (halfsCount === 0) {
              await ref.set(
                {
                  PBP: {
                    ['innings' + inningsCount]: {
                      ['halfs' + halfsCount]: {
                        scoring: {
                          away: {
                            away_runs:
                              dataPBP.game.innings[inningsCount].scoring.away
                                .runs,
                            away_hits:
                              dataPBP.game.innings[inningsCount].scoring.away
                                .hits,
                            away_errors:
                              dataPBP.game.innings[inningsCount].scoring.away
                                .errors,
                          },
                        },
                      },
                    },
                  },
                },
                { merge: true }
              );
            } else {
              await ref.set(
                {
                  PBP: {
                    ['innings' + inningsCount]: {
                      ['halfs' + halfsCount]: {
                        scoring: {
                          home: {
                            home_runs:
                              dataPBP.game.innings[inningsCount].scoring.home
                                .runs,
                            home_hits:
                              dataPBP.game.innings[inningsCount].scoring.home
                                .hits,
                            home_errors:
                              dataPBP.game.innings[inningsCount].scoring.home
                                .errors,
                          },
                        },
                      },
                    },
                  },
                },
                { merge: true }
              );
            }
            if (
              dataPBP.game.innings[inningsCount].halfs[halfsCount].events[
                eventHalfCount
              ].lineup
            ) {
              await ref.set(
                {
                  PBP: {
                    ['innings' + inningsCount]: {
                      ['halfs' + halfsCount]: {
                        ['events' + eventHalfCount]: {
                          lineup:
                            dataPBP.game.innings[inningsCount].halfs[halfsCount]
                              .events[eventHalfCount].lineup,
                        },
                      },
                    },
                  },
                },
                { merge: true }
              );
            }
            if (
              dataPBP.game.innings[inningsCount].halfs[halfsCount].events[
                eventHalfCount
              ].at_bat
            ) {
              await ref.set(
                {
                  PBP: {
                    ['innings' + inningsCount]: {
                      ['halfs' + halfsCount]: {
                        ['events' + eventHalfCount]: {
                          at_bat: {
                            description:
                              dataPBP.game.innings[inningsCount].halfs[
                                halfsCount
                              ].events[eventHalfCount].at_bat.description,
                          },
                        },
                      },
                    },
                  },
                },
                { merge: true }
              );
              for (
                let eventAtbatCount = 0;
                eventAtbatCount <
                dataPBP.game.innings[inningsCount].halfs[halfsCount].events[
                  eventHalfCount
                ].at_bat.events.length;
                eventAtbatCount++
              ) {
                await ref.set(
                  {
                    PBP: {
                      ['innings' + inningsCount]: {
                        ['halfs' + halfsCount]: {
                          ['events' + eventHalfCount]: {
                            at_bat: {
                              ['events' + eventAtbatCount]: dataPBP.game
                                .innings[inningsCount].halfs[halfsCount].events[
                                eventHalfCount
                              ].at_bat.events[eventAtbatCount],
                            },
                          },
                        },
                      },
                    },
                  },
                  { merge: true }
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(
      'error happened in pubsub/MLBpbpInplay function by page',
      error
    );
  }
  modules.firestore
    .collection('pagetest_MLB')
    .doc(betsID)
    .set({ flag: { status: 0 } }, { merge: true });
}
async function transFunction(stringTrans) {
  const keyword = ['á', 'é', 'í', 'ó', 'ú'];
  const keywordTrans = ['a', 'e', 'i', 'o', 'u'];
  const stringAfterTrans = [];
  for (let j = 0; j < stringTrans.length; j++) {
    for (let i = 0; i < keyword.length; i++) {
      stringTrans[j] = await stringTrans[j].replace(
        new RegExp(keyword[i], 'g'),
        keywordTrans[i]
      );
    }
    const temp = await modules.translate(stringTrans[j], {
      from: 'en',
      to: 'zh-tw',
    });
    const temp2 = temp.text.split('（');
    stringAfterTrans.push(temp2[0]);
  }

  return stringAfterTrans;
}
async function summmaryEN(gameID) {
  const enSummaryURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/summary.json?api_key=${mlb_api_key}`;

  try {
    const keywordHome = [];
    const keywordAway = [];
    const numberHome = [];
    const numberAway = [];
    const { data } = await axios(enSummaryURL);
    const dataSummary = data;
    const homeTeamName = dataSummary.game.home.name;
    const awayTeamName = dataSummary.game.away.name;
    for (let i = 0; i < dataSummary.game.home.roster.length; i++) {
      const full_name =
        dataSummary.game.home.roster[i].first_name +
        ' ' +
        dataSummary.game.home.roster[i].last_name;
      keywordHome.push(full_name);
      numberHome.push(dataSummary.game.home.roster[i].jersey_number);
    }
    for (let i = 0; i < dataSummary.game.away.roster.length; i++) {
      const full_name =
        dataSummary.game.away.roster[i].first_name +
        ' ' +
        dataSummary.game.away.roster[i].last_name;
      keywordAway.push(full_name);
      numberAway.push(dataSummary.game.away.roster[i].jersey_number);
    }
    return [
      homeTeamName,
      keywordHome,
      numberHome,
      awayTeamName,
      keywordAway,
      numberAway,
    ];
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpHistory function by page',
      error
    );
    return error;
  }
}

module.exports = { MLBpbpInplay, MLBpbpHistory };
