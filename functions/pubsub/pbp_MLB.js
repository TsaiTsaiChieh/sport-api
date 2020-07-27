const axios = require('axios');
const firebaseAdmin = require('../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const database = firebaseAdmin().database();
const translate = require('@k3rn31p4nic/google-translate-api');
const AppErrors = require('../util/AppErrors');
const transMLB = require('./translateMLB');
const translateMLB = transMLB.translateMLB;
const firestoreName = 'pagetest_MLB';
const mlb_api_key = 'x6t9jymf2hdy8nqy2ayk69db';
const db = require('../util/dbUtil');
// const mlb_api_key = 's7bs62gb8ye8ram6ksr7rkec';
const baseNow = [];
baseNow[0] = 0;
baseNow[1] = 0;
baseNow[2] = 0;
// 14 秒一次
const perStep = 14000;
// 一分鐘4次
const timesPerLoop = 4;
const Match = db.Match;
async function MLBpbpInplay(parameter) {
  const gameID = parameter.gameID;
  const betsID = parameter.betsID;
  const inningsNow = parameter.inningsNow;
  const halfNow = parameter.halfNow;
  const eventHalfNow = parameter.eventHalfNow;
  const eventAtbatNow = parameter.eventAtbatNow;
  const realtimeData = parameter.realtimeData;
  if (
    inningsNow === 0 &&
    halfNow === 0 &&
    eventHalfNow === 0 &&
    eventAtbatNow === 0
  ) {
    // 初始化 realtime database 與 該場球員資訊、姓名翻譯
    await initRealtime(gameID, betsID);
  }

  let countForStatus2 = 0;
  const pbpURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  const summaryURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/summary.json?api_key=${mlb_api_key}`;

  const homeData = realtimeData.home;
  const awayData = realtimeData.away;
  const keywordHome = [];
  const keywordAway = [];
  const transSimpleHome = [];
  const transSimpleAway = [];
  for (let i = 0; i < Object.keys(homeData.roster).length; i++) {
    keywordHome.push(homeData.roster[Object.keys(homeData.roster)[i]].name);
    transSimpleHome.push(
      homeData.roster[Object.keys(homeData.roster)[i]].transSimpleHome
    );
  }
  for (let i = 0; i < Object.keys(awayData.roster).length; i++) {
    keywordAway.push(awayData.roster[Object.keys(awayData.roster)[i]].name);
    transSimpleAway.push(
      awayData.roster[Object.keys(awayData.roster)[i]].transSimpleAway
    );
  }
  const timerForStatus2 = setInterval(async function() {
    try {
      const parameterPBP = {
        inningsNow: inningsNow,
        halfNow: halfNow,
        eventHalfNow: eventHalfNow,
        eventAtbatNow: eventAtbatNow,
        pbpURL: pbpURL,
        betsID: betsID,
        homeData: homeData,
        awayData: awayData,
        keywordHome: keywordHome,
        transSimpleHome: transSimpleHome,
        keywordAway: keywordAway,
        transSimpleAway: transSimpleAway,
        realtimeData: realtimeData
      };
      const parameterSummary = {
        summaryURL: summaryURL,
        betsID: betsID,
        realtimeData: realtimeData
      };
      await doPBP(parameterPBP);
      await doSummary(parameterSummary);
    } catch (error) {
      console.log(
        'error happened in pubsub/MLBpbpInplay function by page',
        error
      );
    }
    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log('pbpMLB is success');
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const homeData = parameter.homeData;
    const awayData = parameter.awayData;
    const keywordHome = parameter.keywordHome;
    const transSimpleHome = parameter.transSimpleHome;
    const transSimpleAway = parameter.transSimpleAway;
    const keywordAway = parameter.keywordAway;
    const pbpURL = parameter.pbpURL;
    const betsID = parameter.betsID;
    const realtimeData = parameter.realtimeData;
    let inningsNow = parameter.inningsNow;
    let halfNow = parameter.halfNow;
    let eventHalfNow = parameter.eventHalfNow;
    let eventAtbatNow = parameter.eventAtbatNow;

    try {
      const { data } = await axios(pbpURL);
      const dataPBP = data;
      const awayLineupLength = dataPBP.game.innings[0].halfs[0].events.length;
      const homeLineupLength = dataPBP.game.innings[0].halfs[1].events.length;
      for (
        let inningsCount = inningsNow;
        inningsCount < dataPBP.game.innings.length;
        inningsCount++
      ) {
        try {
          await database
            .ref(`baseball/MLB/${betsID}/Summary/Now_innings`)
            .set(inningsCount);
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at pbpMLB of doPBP about now_innings by DY`
            )
          );
        }
        // lineup
        if (inningsCount === 0) {
          for (
            let numberCount = 0;
            numberCount < homeLineupLength;
            numberCount++
          ) {
            // write hometeam lineup
            const order =
              dataPBP.game.innings[0].halfs[1].events[numberCount].lineup.order;
            try {
              await database
                .ref(
                  `baseball/MLB/${betsID}/Summary/info/home/Now_lineup/lineup${order}`
                )
                .set({
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
                  h: 0
                });
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpMLB of doPBP about home/now_lineup by DY`
                )
              );
            }
          }
          for (
            let numberCount = 0;
            numberCount < awayLineupLength;
            numberCount++
          ) {
            // write awayteam lineup
            const order =
              dataPBP.game.innings[0].halfs[0].events[numberCount].lineup.order;
            try {
              await database
                .ref(
                  `baseball/MLB/${betsID}/Summary/info/away/Now_lineup/lineup${order}`
                )
                .set({
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
                  h: 0
                });
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpMLB of doPBP about away/now_lineup by DY`
                )
              );
            }
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
            let halfCount = halfNow;
            halfCount < dataPBP.game.innings[inningsCount].halfs.length;
            halfCount++
          ) {
            try {
              await database
                .ref(`baseball/MLB/${betsID}/Summary/Now_halfs`)
                .set(halfCount);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpMLB of doPBP about now_halfs by DY`
                )
              );
            }
            if (halfCount !== halfNow) {
              halfNow = halfNow + 1;
              eventHalfNow = 0;
              eventAtbatNow = 0;
              baseNow[0] = 0;
              baseNow[1] = 0;
              baseNow[2] = 0;
            }

            for (
              let eventHalfCount = eventHalfNow;
              eventHalfCount <
              dataPBP.game.innings[inningsCount].halfs[halfCount].events.length;
              eventHalfCount++
            ) {
              if (halfCount === 0) {
                try {
                  await database
                    .ref(
                      `baseball/MLB/${betsID}/Summary/info/away/Innings${inningsCount}/scoring`
                    )
                    .set({
                      runs:
                        dataPBP.game.innings[inningsCount].scoring.away.runs,
                      errors:
                        dataPBP.game.innings[inningsCount].scoring.away.errors,
                      hits: dataPBP.game.innings[inningsCount].scoring.away.hits
                    });
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at pbpMLB of doPBP about away/scoring by DY`
                    )
                  );
                }
              }
              if (halfCount === 1) {
                try {
                  await database
                    .ref(
                      `baseball/MLB/${betsID}/Summary/info/home/Innings${inningsCount}/scoring`
                    )
                    .set({
                      runs:
                        dataPBP.game.innings[inningsCount].scoring.home.runs,
                      errors:
                        dataPBP.game.innings[inningsCount].scoring.home.errors,
                      hits: dataPBP.game.innings[inningsCount].scoring.home.hits
                    });
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at pbpMLB of doPBP about home/scoring by DY`
                    )
                  );
                }
              }
              if (
                dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].lineup
              ) {
                eventAtbatNow = 0;
                if (halfCount === 0) {
                  try {
                    await database
                      .ref(
                        `baseball/MLB/${betsID}/Summary/info/away/Now_lineup/lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].lineup.order}`
                      )
                      .set({
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
                            .events[eventHalfCount].lineup.position
                      });
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about away/now_lineup by DY`
                      )
                    );
                  }
                } else {
                  try {
                    await database
                      .ref(
                        `baseball/MLB/${betsID}/Summary/info/home/Now_lineup/lineup${dataPBP.game.innings[inningsCount].halfs[halfCount].events[eventHalfCount].lineup.order}`
                      )
                      .set({
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
                            .events[eventHalfCount].lineup.position
                      });
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about home/now_innings by DY`
                      )
                    );
                  }
                }

                const totalDescriptionOrEachBall = 0;
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
                try {
                  await database
                    .ref(
                      `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/lineup/description`
                    )
                    .set(
                      dataPBP.game.innings[inningsCount].halfs[halfCount]
                        .events[eventHalfCount].lineup.description
                    );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at pbpMLB of doPBP about description by DY`
                    )
                  );
                }
                try {
                  await database
                    .ref(
                      `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/lineup/description_ch`
                    )
                    .set(descCH);
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at pbpMLB of doPBP about desription_ch by DY`
                    )
                  );
                }
              }

              if (
                dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].at_bat
              ) {
                const pitcherInfo = {};
                if (halfCount === 0) {
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
                if (halfCount === 1) {
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
                try {
                  await database
                    .ref(`baseball/MLB/${betsID}/Summary/Now_pitcher`)
                    .set({
                      first_name:
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.pitcher.first_name,
                      last_name:
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.pitcher.last_name,
                      jersey_number:
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.pitcher.jersey_number,
                      id:
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.pitcher.id,
                      ip: pitcherInfo.ip,
                      strikes: pitcherInfo.strikes,
                      balls: pitcherInfo.balls,
                      er: pitcherInfo.er,
                      h: pitcherInfo.h,
                      k: pitcherInfo.k
                    });
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at pbpMLB of doPBP about now_pitcher by DY`
                    )
                  );
                }
                const hitterID =
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.hitter_id;
                let realtimeDataForLineup;
                if (halfCount === 0) {
                  realtimeDataForLineup = realtimeData.Summary.info.away;
                } else {
                  realtimeDataForLineup = realtimeData.Summary.info.home;
                }
                for (let i = 1; i < 10; i++) {
                  if (
                    hitterID ===
                    realtimeDataForLineup.Now_lineup[`lineup${i}`].player_id
                  ) {
                    let count1 = i % 9;
                    if (count1 === 0) {
                      count1 = 9;
                    }
                    let count2 = (i + 1) % 9;
                    if (count2 === 0) {
                      count2 = 9;
                    }
                    let count3 = (i + 2) % 9;
                    if (count3 === 0) {
                      count3 = 9;
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Now_order`)
                        .set(
                          realtimeDataForLineup.Now_lineup[`lineup${count1}`]
                            .order
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about now_order by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Now_hitter`)
                        .set(
                          realtimeDataForLineup.Now_lineup[`lineup${count1}`]
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about now_hitter by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Now_hitter/ab`)
                        .set(
                          realtimeDataForLineup.roster[
                            `lineup${
                              realtimeData.Now_lineup[`lineup${count1}`]
                                .jersey_number
                            }`
                          ].ab
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about now_hitter/ab by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Now_hitter/h`)
                        .set(
                          realtimeDataForLineup.roster[
                            `lineup${
                              realtimeDataForLineup.Now_lineup[
                                `lineup${count1}`
                              ].jersey_number
                            }`
                          ].h
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about now_hitter/h by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Next1_hitter`)
                        .set(
                          realtimeDataForLineup.Now_lineup[`lineup${count2}`]
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about next1_hitter by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Next1_hitter/ab`)
                        .set(
                          realtimeDataForLineup.roster[
                            `lineup${
                              realtimeDataForLineup.Now_lineup[
                                `lineup${count2}`
                              ].jersey_number
                            }`
                          ].ab
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about next1_hitter/ab by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Next1_hitter/h`)
                        .set(
                          realtimeDataForLineup.roster[
                            `lineup${
                              realtimeDataForLineup.Now_lineup[
                                `lineup${count2}`
                              ].jersey_number
                            }`
                          ].h
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about next1_hitter/h by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Next2_hitter`)
                        .set(
                          realtimeDataForLineup.Now_lineup[`lineup${count3}`]
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about next2_hitter by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Next2_hitter/ab`)
                        .set(
                          realtimeDataForLineup.roster[
                            `lineup${
                              realtimeDataForLineup.Now_lineup[
                                `lineup${count3}`
                              ].jersey_number
                            }`
                          ].ab
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about next2_hitter/ab by DY`
                        )
                      );
                    }
                    try {
                      await database
                        .ref(`baseball/MLB/${betsID}/Summary/Next2_hitter/h`)
                        .set(
                          realtimeDataForLineup.roster[
                            `lineup${
                              realtimeDataForLineup.Now_lineup[
                                `lineup${count3}`
                              ].jersey_number
                            }`
                          ].h
                        );
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about next2_hitter/h by DY`
                        )
                      );
                    }
                    break;
                  }
                }

                if (
                  dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                    eventHalfCount
                  ].at_bat.description
                ) {
                  const totalDescriptionOrEachBall = 0;
                  const desResultCH = await translateMLB(
                    dataPBP.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.description,
                    keywordHome,
                    keywordAway,
                    transSimpleHome,
                    transSimpleAway,
                    totalDescriptionOrEachBall
                  );
                  try {
                    await database
                      .ref(
                        `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/description`
                      )
                      .set(
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.description
                      );
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about at_bat/description by DY`
                      )
                    );
                  }
                  try {
                    await database
                      .ref(
                        `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/description_ch`
                      )
                      .set(desResultCH);
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about at_bat/description_ch by DY`
                      )
                    );
                  }
                }
                if (eventHalfCount !== eventHalfNow) {
                  eventHalfNow = eventHalfNow + 1;
                  eventAtbatNow = 0;
                }
                for (
                  let eventAtbatCount = eventAtbatNow;
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
                    const totalDescriptionOrEachBall = 1;
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
                    try {
                      await database
                        .ref(
                          `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs${halfCount}/events${eventHalfCount}/at_bat/events${eventAtbatCount}`
                        )
                        .set({
                          description:
                            dataPBP.game.innings[inningsCount].halfs[halfCount]
                              .events[eventHalfCount].at_bat.events[
                                eventAtbatCount
                              ].outcome_id,
                          description_ch: desResultCH
                        });
                    } catch (err) {
                      return reject(
                        new AppErrors.FirebaseRealtimeError(
                          `${err} at pbpMLB of doPBP about at_bat by DY`
                        )
                      );
                    }
                  }

                  // 球數
                  try {
                    await database
                      .ref(`baseball/MLB/${betsID}/Summary/Now_strikes`)
                      .set(
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .count.strikes
                      );
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about now_strikes by DY`
                      )
                    );
                  }
                  try {
                    await database
                      .ref(`baseball/MLB/${betsID}/Summary/Now_balls`)
                      .set(
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .count.balls
                      );
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about now_balls by DY`
                      )
                    );
                  }
                  try {
                    await database
                      .ref(`baseball/MLB/${betsID}/Summary/Now_outs`)
                      .set(
                        dataPBP.game.innings[inningsCount].halfs[halfCount]
                          .events[eventHalfCount].at_bat.events[eventAtbatCount]
                          .count.outs
                      );
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about now_outs by DY`
                      )
                    );
                  }
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
                  try {
                    await database
                      .ref(`baseball/MLB/${betsID}/Summary/Now_firstbase`)
                      .set(baseNow[0]);
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about now_firstbase by DY`
                      )
                    );
                  }
                  try {
                    await database
                      .ref(`baseball/MLB/${betsID}/Summary/Now_secondbase`)
                      .set(baseNow[1]);
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about now_secondbase by DY`
                      )
                    );
                  }
                  try {
                    await database
                      .ref(`baseball/MLB/${betsID}/Summary/Now_thirdbase`)
                      .set(baseNow[2]);
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseRealtimeError(
                        `${err} at pbpMLB of doPBP about now_thirdbase by DY`
                      )
                    );
                  }
                }
              }
            }
          }
        }
      }
      if (dataPBP.game.status !== 'inprogress') {
        await database
          .ref(`baseball/MLB/${betsID}/Summary/statuts`)
          .set('closed');
      } else if (dataPBP.game.status === 'inprogress') {
        if (realtimeData.Summary.status !== 'inprogress') {
          try {
            await firestore
              .collection(firestoreName)
              .doc(betsID)
              .set({ flag: { status: 1 } }, { merge: true });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseCollectError(
                `${err} at pbpMLB of doPBP about status by DY`
              )
            );
          }
          try {
            await database
              .ref(`baseball/MLB/${betsID}/Summary/statuts`)
              .set('inprogress');
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpMLB of doPBP about status by DY`
              )
            );
          }
          try {
            await Match.upsert({
              bets_id: betsID,
              status: 1
            });
          } catch (err) {
            return reject(
              new AppErrors.MysqlError(
                `${err} at pbpMLB of doPBP about status by DY`
              )
            );
          }
        }
      } else {
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpMLB of doPBP by DY`)
      );
    }
  });
}
async function doSummary(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const summaryURL = parameter.summaryURL;
    try {
      const { data } = await axios(summaryURL);
      const dataSummary = data;

      for (let i = 0; i < dataSummary.game.home.players.length; i++) {
        const number = dataSummary.game.home.players[i].jersey_number;

        if (dataSummary.game.home.players[i].position === 'P') {
          try {
            await database
              .ref(
                `baseball/MLB/${betsID}/Summary/info/home/roster/lineup${number}/performance`
              )
              .set({
                ab: null,
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
                play: 1
              });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpMLB of doSummary about home/pitcher/performance by DY`
              )
            );
          }
        } else {
          try {
            await database
              .ref(
                `baseball/MLB/${betsID}/Summary/info/home/roster/lineup${number}/performance`
              )
              .set({
                ab: dataSummary.game.home.players[i].hitting.overall.ab,
                h: dataSummary.game.home.players[i].hitting.onbase.h,
                ip: null,
                strikes: null,
                balls: null,
                er: null,
                k: null,
                play: 1
              });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpMLB of doSummary about home/hitter/performance by DY`
              )
            );
          }
        }
      }
      for (let i = 0; i < dataSummary.game.away.players.length; i++) {
        const number = dataSummary.game.away.players[i].jersey_number;

        if (dataSummary.game.home.players[i].position === 'P') {
          try {
            await database
              .ref(
                `baseball/MLB/${betsID}/Summary/info/away/roster/lineup${number}/performance`
              )
              .set({
                ab: null,
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
                play: 1
              });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpMLB of doSummary about away/pitcher/performance by DY`
              )
            );
          }
        } else {
          try {
            await database
              .ref(
                `baseball/MLB/${betsID}/Summary/info/away/roster/lineup${number}/performance`
              )
              .set({
                ab: dataSummary.game.away.players[i].hitting.overall.ab,
                h: dataSummary.game.away.players[i].hitting.onbase.h,
                ip: null,
                strikes: null,
                balls: null,
                er: null,
                k: null,
                play: 1
              });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpMLB of doSummary about away/hitter/performance by DY`
              )
            );
          }
        }
      }
      try {
        await database
          .ref(`baseball/MLB/${betsID}/Summary/info/home/Total`)
          .set({
            runs: dataSummary.game.home.runs,
            hits: dataSummary.game.home.hits,
            errors: dataSummary.game.home.errors
          });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpMLB of doSummary about home/total by DY`
          )
        );
      }
      try {
        await database
          .ref(`baseball/MLB/${betsID}/Summary/info/away/Total`)
          .set({
            runs: dataSummary.game.away.runs,
            hits: dataSummary.game.away.hits,
            errors: dataSummary.game.away.errors
          });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpMLB of doSummary about away/total by DY`
          )
        );
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpMLB of doSummary by DY`)
      );
    }
  });
}
async function MLBpbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    const gameID = parameter.gameID;
    const betsID = parameter.betsID;
    const gameTime = parameter.scheduled;
    const pbpURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
    const summaryURL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/summary.json?api_key=${mlb_api_key}`;
    try {
      let { data } = await axios(pbpURL);
      const dataPBP = data;
      const ref = firestore
        .collection(`${firestoreName}_PBP`)
        .doc(betsID);
      for (
        let inningsCount = 0;
        inningsCount < dataPBP.game.innings.length;
        inningsCount++
      ) {
        if (inningsCount === 0) {
          for (let i = 0; i < 9; i++) {
            try {
              await ref.set(
                {
                  PBP: {
                    innings0: {
                      halfs0: {
                        ['lineup' + i]: dataPBP.game.innings[0].halfs[0].events[
                          i
                        ]
                      }
                    }
                  }
                },
                { merge: true }
              );
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at pbpMLB of pbpHistory by DY`
                )
              );
            }
            try {
              await ref.set(
                {
                  PBP: {
                    innings0: {
                      halfs1: {
                        ['lineup' + i]: dataPBP.game.innings[0].halfs[1].events[
                          i
                        ]
                      }
                    }
                  }
                },
                { merge: true }
              );
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at pbpMLB of pbpHistory by DY`
                )
              );
            }
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
              dataPBP.game.innings[inningsCount].halfs[halfsCount].events
                .length;
              eventHalfCount++
            ) {
              if (halfsCount === 0) {
                try {
                  await ref.set(
                    {
                      PBP: {
                        ['innings' + inningsCount]: {
                          ['halfs' + halfsCount]: {
                            scoring: {
                              away: {
                                away_runs:
                                  dataPBP.game.innings[inningsCount].scoring
                                    .away.runs,
                                away_hits:
                                  dataPBP.game.innings[inningsCount].scoring
                                    .away.hits,
                                away_errors:
                                  dataPBP.game.innings[inningsCount].scoring
                                    .away.errors
                              }
                            }
                          }
                        }
                      }
                    },
                    { merge: true }
                  );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseCollectError(
                      `${err} at pbpMLB of pbpHistory by DY`
                    )
                  );
                }
              } else {
                try {
                  await ref.set(
                    {
                      PBP: {
                        ['innings' + inningsCount]: {
                          ['halfs' + halfsCount]: {
                            scoring: {
                              home: {
                                home_runs:
                                  dataPBP.game.innings[inningsCount].scoring
                                    .home.runs,
                                home_hits:
                                  dataPBP.game.innings[inningsCount].scoring
                                    .home.hits,
                                home_errors:
                                  dataPBP.game.innings[inningsCount].scoring
                                    .home.errors
                              }
                            }
                          }
                        }
                      }
                    },
                    { merge: true }
                  );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseCollectError(
                      `${err} at pbpMLB of pbpHistory by DY`
                    )
                  );
                }
              }
              if (
                dataPBP.game.innings[inningsCount].halfs[halfsCount].events[
                  eventHalfCount
                ].lineup
              ) {
                try {
                  await ref.set(
                    {
                      PBP: {
                        ['innings' + inningsCount]: {
                          ['halfs' + halfsCount]: {
                            ['events' + eventHalfCount]: {
                              lineup:
                                dataPBP.game.innings[inningsCount].halfs[
                                  halfsCount
                                ].events[eventHalfCount].lineup
                            }
                          }
                        }
                      }
                    },
                    { merge: true }
                  );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseCollectError(
                      `${err} at pbpMLB of pbpHistory by DY`
                    )
                  );
                }
              }
              if (
                dataPBP.game.innings[inningsCount].halfs[halfsCount].events[
                  eventHalfCount
                ].at_bat
              ) {
                try {
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
                                  ].events[eventHalfCount].at_bat.description
                              }
                            }
                          }
                        }
                      }
                    },
                    { merge: true }
                  );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseCollectError(
                      `${err} at pbpMLB of pbpHistory by DY`
                    )
                  );
                }
                for (
                  let eventAtbatCount = 0;
                  eventAtbatCount <
                  dataPBP.game.innings[inningsCount].halfs[halfsCount].events[
                    eventHalfCount
                  ].at_bat.events.length;
                  eventAtbatCount++
                ) {
                  try {
                    await ref.set(
                      {
                        PBP: {
                          [`innings${inningsCount}`]: {
                            [`halfs${halfsCount}`]: {
                              [`events${eventHalfCount}`]: {
                                at_bat: {
                                  [`events${eventAtbatCount}`]: dataPBP.game
                                    .innings[inningsCount].halfs[halfsCount]
                                    .events[eventHalfCount].at_bat.events[
                                      eventAtbatCount
                                    ]
                                }
                              }
                            }
                          }
                        }
                      },
                      { merge: true }
                    );
                  } catch (err) {
                    return reject(
                      new AppErrors.FirebaseCollectError(
                        `${err} at pbpMLB of pbpHistory by DY`
                      )
                    );
                  }
                }
              }
            }
          }
        }
      }
      // call summary
      ({ data } = await axios(summaryURL));
      const dataSummary = data;
      try {
        await ref.set(
          {
            bets_id: betsID,
            radar_id: gameID,
            scheduled: gameTime,
            home: {
              home_runs: dataSummary.game.home.runs,
              home_hits: dataSummary.game.home.hits,
              home_errors: dataSummary.game.home.errors
            },
            away: {
              away_runs: dataSummary.game.away.runs,
              away_hits: dataSummary.game.away.hits,
              away_errors: dataSummary.game.away.errors
            }
          },
          { merge: true }
        );
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at pbpMLB of pbpHistory by DY`
          )
        );
      }
      try {
        await firestore
          .collection('pagetest_MLB')
          .doc(betsID)
          .set({ flag: { status: 0 } }, { merge: true });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at pbpMLB of pbpHistory about status by DY`
          )
        );
      }
      try {
        await database
          .ref(`baseball/MLB/${betsID}/Summary/statuts`)
          .set('closed');
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpMLB of pbpHistory about status by DY`
          )
        );
      }
      try {
        await Match.upsert({
          bets_id: betsID,
          home_points: dataSummary.game.home.runs,
          away_points: dataSummary.game.away.runs,
          status: 0
        });
      } catch (err) {
        return reject(
          new AppErrors.MysqlError(
            `${err} at pbpMLB of pbpHistory about status by DY`
          )
        );
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpMLB of pbpHistory by DY`)
      );
    }
  });
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

    const temp = await translate(stringTrans[j], {
      from: 'en',
      to: 'zh-tw'
    });
    const temp2 = temp.text.split('（');
    stringAfterTrans.push(temp2[0]);
  }

  return stringAfterTrans;
}
async function summmaryEN(gameID) {
  return new Promise(async function(resolve, reject) {
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
        numberAway
      ];
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at summaryEN by DY`));
    }
  });
}
async function initRealtime(gameID, betsID) {
  return new Promise(async function(resolve, reject) {
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
        numberAway
      ] = await summmaryEN(gameID);
      keywordTransHome = await transFunction(keywordHome);
      keywordTransAway = await transFunction(keywordAway);
      const transSimpleHome = [];
      const transSimpleAway = [];
      try {
        await database
          .ref(`baseball/MLB/${betsID}/Summary/info/home/name`)
          .set(homeTeamName);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at initRealtime of homename by DY`
          )
        );
      }
      try {
        await database
          .ref(`baseball/MLB/${betsID}/Summary/info/away/name`)
          .set(awayTeamName);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at initRealtime of awayname by DY`
          )
        );
      }
      for (let i = 0; i < keywordHome.length; i++) {
        transSimpleHome[i] = `${keywordHome[i]}(#${numberHome[i]})`;
        try {
          await database
            .ref(
              `baseball/MLB/${betsID}/Summary/info/home/roster/lineup${numberHome[i]}`
            )
            .set({
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
              k: 0,
              play: 0
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at initRealtime of home/roster by DY`
            )
          );
        }
      }
      for (let i = 0; i < keywordAway.length; i++) {
        transSimpleAway[i] = `${keywordAway[i]}(#${numberAway[i]})`;
        try {
          await database
            .ref(
              `baseball/MLB/${betsID}/Summary/info/away/roster/lineup${numberAway[i]}`
            )
            .set({
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
              k: 0,
              play: 0
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at initRealtime of away/roster by DY`
            )
          );
        }
      }
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at initRealtime by DY`));
    }
  });
}
module.exports = { MLBpbpInplay, MLBpbpHistory };
