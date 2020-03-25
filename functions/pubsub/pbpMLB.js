const modules = require('../util/modules');
const axios = require('axios');

let homeLineup = [];
let awayLineup = [];
let baseNow = [];
//清空壘包
baseNow[0] = 0;
baseNow[1] = 0;
baseNow[2] = 0;
async function MLBpbpInplay(parameter) {
  let gameID = parameter.gameID;
  let betsID = parameter.betsID;
  let inningsNow = parameter.inningsNow;
  let halfNow = parameter.halfNow;
  let eventHalfNow = parameter.eventHalfNow;
  let eventAtbatNow = parameter.eventAtbatNow;

  const mlb_api_key = 's7bs62gb8ye8ram6ksr7rkec';
  const timesPerLoop = 11;
  const firestoreName = 'pagetest_MLB';
  let countForStatus2 = 0;
  // PBP API
  const URL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  // Summary API
  const URL2 = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/summary.json?api_key=${mlb_api_key}`;

  let inningsCount;
  let numberCount;
  let halfCount;
  let eventHalfCount;
  let eventAtbatCount;

  let timerForStatus2 = setInterval(async function() {
    try {
      // 目前的總比分
      let { data } = await axios(URL);
      let ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/status`);
      await ref.set(data.game.status);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/Total/home/runs`
      );
      await ref.set(data.game.scoring.home.runs);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/Total/home/hits`
      );
      await ref.set(data.game.scoring.home.hits);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/Total/home/errors`
      );
      await ref.set(data.game.scoring.home.errors);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/Total/away/runs`
      );
      await ref.set(data.game.scoring.away.runs);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/Total/away/hits`
      );
      await ref.set(data.game.scoring.away.hits);
      ref = modules.database.ref(
        `baseball/MLB/${betsID}/Summary/Total/away/errors`
      );
      await ref.set(data.game.scoring.away.errors);
      for (
        inningsCount = inningsNow;
        inningsCount < data.game.innings.length;
        inningsCount++
      ) {
        // lineup
        if (inningsCount == 0) {
          let awayLineupLength = data.game.innings[0].halfs[0].events.length;
          let homeLineupLength = data.game.innings[0].halfs[1].events.length;
          for (numberCount = 0; numberCount < homeLineupLength; numberCount++) {
            // write hometeam lineup
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs1/lineup${numberCount}`
            );
            homeLineup.push(
              data.game.innings[0].halfs[1].events[numberCount].lineup.id
            );
            await ref.set(data.game.innings[0].halfs[1].events[numberCount]);
          }
          for (numberCount = 0; numberCount < awayLineupLength; numberCount++) {
            // write awayteam lineup
            ref = modules.database.ref(
              `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs0/lineup${numberCount}`
            );
            awayLineup.push(
              data.game.innings[0].halfs[0].events[numberCount].lineup.id
            );
            await ref.set(data.game.innings[0].halfs[0].events[numberCount]);
          }
          inningsNow = inningsNow + 1;
        }
        if (inningsCount >= 1) {
          // normal play
          if (inningsCount != inningsNow) {
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
            halfCount < data.game.innings[inningsCount].halfs.length;
            halfCount++
          ) {
            if (halfCount != halfNow) {
              halfNow = halfNow + 1;
              eventHalfNow = 0;
              eventAtbatNow = 0;
              baseNow[0] = 0;
              baseNow[1] = 0;
              baseNow[2] = 0;
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
            for (
              eventHalfCount = eventHalfNow;
              eventHalfCount <
              data.game.innings[inningsCount].halfs[halfCount].events.length;
              eventHalfCount++
            ) {
              if (halfCount == 0) {
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs0/scoring/away/runs`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.away.runs
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs0/scoring/runs`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.away.runs
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs0/scoring/away/errors`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.away.errors
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs0/scoring/away/hits`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.away.hits
                );
              }
              if (halfCount == 1) {
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs1/scoring/home/runs`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.home.runs
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/Summary/Innings${inningsCount}/halfs1/scoring/runs`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.home.runs
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs1/scoring/home/hits`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.home.hits
                );
                ref = modules.database.ref(
                  `baseball/MLB/${betsID}/PBP/Innings${inningsCount}/halfs1/scoring/home/errors`
                );
                await ref.set(
                  data.game.innings[inningsCount].scoring.home.errors
                );
              }

              if (
                data.game.innings[inningsCount].halfs[halfCount].events[
                  eventHalfCount
                ].lineup
              ) {
                eventAtbatNow = 0;
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
                if (eventHalfCount != eventHalfNow) {
                  eventHalfNow = eventHalfNow + 1;
                  eventAtbatNow = 0;
                }

                for (
                  eventAtbatCount = eventAtbatNow;
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
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_strikes`
                  );
                  await ref.set(
                    data.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].count.strikes
                  );
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_balls`
                  );
                  await ref.set(
                    data.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].count.balls
                  );
                  ref = modules.database.ref(
                    `baseball/MLB/${betsID}/Summary/Now_outs`
                  );
                  await ref.set(
                    data.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].count.outs
                  );

                  if (
                    data.game.innings[inningsCount].halfs[halfCount].events[
                      eventHalfCount
                    ].at_bat.events[eventAtbatCount].runner
                  ) {
                    let baseInformation =
                      data.game.innings[inningsCount].halfs[halfCount].events[
                        eventHalfCount
                      ].at_bat.events[eventAtbatCount].runners.length;
                    for (
                      let baseCount = 0;
                      baseCount < baseInformation;
                      baseCount++
                    ) {
                      //壘包資訊
                      let startBase =
                        data.game.innings[inningsCount].halfs[halfCount].events[
                          eventHalfCount
                        ].at_bat.events[eventAtbatCount].runners[baseCount]
                          .starting_base;
                      let endBase =
                        data.game.innings[inningsCount].halfs[halfCount].events[
                          eventHalfCount
                        ].at_bat.events[eventAtbatCount].runners[baseCount]
                          .ending_base;
                      if (endBase == 0) {
                        // 壘上出局
                        baseNow[startBase - 1] = 0;
                      } else if (endBase == 4) {
                        // 回本壘
                        baseNow[startBase - 1] = 0;
                      } else {
                        baseNow[startBase - 1] = 0;
                        baseNow[ending_base - 1] = 1;
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
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/Now_innings`);
      await ref.set(inningsNow);
      ref = modules.database.ref(`baseball/MLB/${betsID}/Summary/Now_halfs`);
      await ref.set(halfNow);

      if (data.game.status != 'inprogress' || data.game.status != 'complete') {
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
  }, 5000);
}

async function MLBpbpHistory(parameter) {
  const mlb_api_key = 's7bs62gb8ye8ram6ksr7rkec';
  const firestoreName = 'pagetest_MLB_PBP';
  let gameID = parameter.gameID;
  let betsID = parameter.betsID;
  let gameTime = parameter.scheduled;
  const URL = `http://api.sportradar.us/mlb/trial/v6.6/en/games/${gameID}/pbp.json?api_key=${mlb_api_key}`;
  try {
    let { data } = await axios(URL);
    ref = modules.firestore.collection(firestoreName).doc(betsID);
    await ref.set(
      {
        bets_id: betsID,
        radar_id: gameID,
        scheduled: gameTime,
        home: {
          home_runs: data.game.scoring.home.runs,
          home_hits: data.game.scoring.home.hits,
          home_errors: data.game.scoring.home.errors
        },
        away: {
          away_runs: data.game.scoring.away.runs,
          away_hits: data.game.scoring.away.hits,
          away_errors: data.game.scoring.away.errors
        }
      },
      { merge: true }
    );
    //pbp
    for (
      let inningsCount = 0;
      inningsCount < data.game.innings.length;
      inningsCount++
    ) {
      if (inningsCount == 0) {
        for (let i = 0; i < 10; i++) {
          await ref.set(
            {
              PBP: {
                ['innings0']: {
                  ['halfs0']: {
                    ['lineup' + i]: data.game.innings[0].halfs[0].events[i]
                  }
                }
              }
            },
            { merge: true }
          );
          await ref.set(
            {
              PBP: {
                ['innings0']: {
                  ['halfs1']: {
                    ['lineup' + i]: data.game.innings[0].halfs[1].events[i]
                  }
                }
              }
            },
            { merge: true }
          );
        }
      } else {
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
            if (halfsCount == 0) {
              await ref.set(
                {
                  PBP: {
                    ['innings' + inningsCount]: {
                      ['halfs' + halfsCount]: {
                        scoring: {
                          away: {
                            away_runs:
                              data.game.innings[inningsCount].scoring.away.runs,
                            away_hits:
                              data.game.innings[inningsCount].scoring.away.hits,
                            away_errors:
                              data.game.innings[inningsCount].scoring.away
                                .errors
                          }
                        }
                      }
                    }
                  }
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
                              data.game.innings[inningsCount].scoring.home.runs,
                            home_hits:
                              data.game.innings[inningsCount].scoring.home.hits,
                            home_errors:
                              data.game.innings[inningsCount].scoring.home
                                .errors
                          }
                        }
                      }
                    }
                  }
                },
                { merge: true }
              );
            }
            if (
              data.game.innings[inningsCount].halfs[halfsCount].events[
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
                            data.game.innings[inningsCount].halfs[halfsCount]
                              .events[eventHalfCount].lineup
                        }
                      }
                    }
                  }
                },
                { merge: true }
              );
            }
            if (
              data.game.innings[inningsCount].halfs[halfsCount].events[
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
                              data.game.innings[inningsCount].halfs[halfsCount]
                                .events[eventHalfCount].at_bat.description
                          }
                        }
                      }
                    }
                  }
                },
                { merge: true }
              );
              for (
                let eventAtbatCount = 0;
                eventAtbatCount <
                data.game.innings[inningsCount].halfs[halfsCount].events[
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
                              ['events' + eventAtbatCount]: data.game.innings[
                                inningsCount
                              ].halfs[halfsCount].events[eventHalfCount].at_bat
                                .events[eventAtbatCount]
                            }
                          }
                        }
                      }
                    }
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

module.exports = { MLBpbpInplay, MLBpbpHistory };
