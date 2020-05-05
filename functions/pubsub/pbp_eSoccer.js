const modules = require('../util/modules');
const db = require('../util/dbUtil');
const firestoreName = 'pagetest_eSoccer';
const AppErrors = require('../util/AppErrors');
// 14 秒一次
const perStep = 14000;
// 一分鐘4次
const timesPerLoop = 4;
const Match = db.Match;
async function ESoccerpbpInplay(parameter) {
  const betsID = parameter.betsID;
  const pbpURL = `https://api.betsapi.com/v1/event/view?token=${modules.betsToken}&event_id=${betsID}`;
  const realtimeData = parameter.realtimeData;
  let countForStatus2 = 0;

  const parameterPBP = {
    betsID: betsID,
    pbpURL: pbpURL,
    realtimeData: realtimeData
  };
  const timerForStatus2 = setInterval(async function () {
    await doPBP(parameterPBP);
    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : checkmatch_ESoccer success`);
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function ESoccerpbpHistory(parameter) {
  return new Promise(async function (resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = `https://api.betsapi.com/v1/event/view?token=${modules.betsToken}&event_id=${betsID}`;
    try {
      const { data } = await modules.axios(pbpURL);

      if (!data.results[0].timer) {
        data.results[0].timer = { tm: 'xx', ts: 'xx' };
      }
      if (!data.results[0].ss) {
        data.results[0].ss = 'no data';
      }
      if (!data.results[0].stats) {
        data.results[0].stats = {};
      }
      if (!data.results[0].stats.attacks) {
        data.results[0].stats.attacks = ['no data', 'no data'];
      }
      if (!data.results[0].stats.ball_safe) {
        data.results[0].stats.ball_safe = ['no data', 'no data'];
      }
      if (!data.results[0].stats.corners) {
        data.results[0].stats.corners = ['no data', 'no data'];
      }
      if (!data.results[0].stats.dangerous_attacks) {
        data.results[0].stats.dangerous_attacks = ['no data', 'no data'];
      }
      if (!data.results[0].stats.goals) {
        data.results[0].stats.goals = ['no data', 'no data'];
      }
      if (!data.results[0].stats.off_target) {
        data.results[0].stats.off_target = ['no data', 'no data'];
      }
      if (!data.results[0].stats.on_target) {
        data.results[0].stats.on_target = ['no data', 'no data'];
      }
      if (!data.results[0].stats.yellowcards) {
        data.results[0].stats.yellowcards = ['no data', 'no data'];
      }
      if (!data.results[0].stats.redcards) {
        data.results[0].stats.redcards = ['no data', 'no data'];
      }

      let homeScores = 'no data';
      let awayScores = 'no data';
      if (data.results[0].ss !== 'no data') {
        homeScores = data.results[0].ss.split('-')[0];
        awayScores = data.results[0].ss.split('-')[1];
      }
      try {
        await modules.firestore
          .collection(`${firestoreName}_PBP`)
          .doc(betsID)
          .set(
            {
              league: {
                name: data.results[0].league.name,
                id: data.results[0].league.id
              },
              Now_clock: `${data.results[0].timer.tm}:${data.results[0].timer.ts}`,
              home: {
                name: data.results[0].home.name,
                Total: {
                  score: homeScores,
                  attacks: data.results[0].stats.attacks[0],
                  ball_safe: data.results[0].stats.ball_safe[0],
                  corners: data.results[0].stats.corners[0],
                  dangerous_attacks: data.results[0].stats.dangerous_attacks[0],
                  goals: data.results[0].stats.goals[0],
                  off_target: data.results[0].stats.off_target[0],
                  on_target: data.results[0].stats.on_target[0],
                  yellowcards: data.results[0].stats.yellowcards[0],
                  redcards: data.results[0].stats.redcards[0]
                }
              },
              away: {
                name: data.results[0].away.name,
                Total: {
                  score: awayScores,
                  attacks: data.results[0].stats.attacks[1],
                  ball_safe: data.results[0].stats.ball_safe[1],
                  corners: data.results[0].stats.corners[1],
                  dangerous_attacks: data.results[0].stats.dangerous_attacks[1],
                  goals: data.results[0].stats.goals[1],
                  off_target: data.results[0].stats.off_target[1],
                  on_target: data.results[0].stats.on_target[1],
                  yellowcards: data.results[0].stats.yellowcards[1],
                  redcards: data.results[0].stats.redcards[1]
                }
              }
            },
            { merge: true }
          );
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at pbpESoccer of rawdata by DY`
          )
        );
      }
      try {
        await modules.firestore
          .collection('pagetest_eSoccer')
          .doc(betsID)
          .set({ flag: { status: 0 } }, { merge: true });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at pbpESoccer of status by DY`
          )
        );
      }

      try {
        await Match.upsert({
          bets_id: betsID,
          home_points: homeScores,
          away_points: awayScores,
          status: 0
        });
      } catch (err) {
        return reject(
          new AppErrors.MysqlError(`${err} at pbpESoccer of Match by DY`)
        );
      }
      try {
        await modules.database
          .ref(`esports/eSoccer/${betsID}/Summary/status`)
          .set('closed');
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpESoccer of status by DY`
          )
        );
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpESoccer of PBPHistory by DY`)
      );
    }
    return resolve('ok');
  });
}
async function doPBP(parameter) {
  return new Promise(async function (resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const realtimeData = parameter.realtimeData;
    try {
      const { data } = await modules.axios(pbpURL);

      if (data.results[0]) {
        if (data.results[0].time_status) {
          if (data.results[0].time_status === '3') {
            if (realtimeData.Summary.status !== 'closed') {
              try {
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/status`)
                  .set('closed');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at doPBP of status on ${betsID} by DY`
                  )
                );
              }
            }
          }

          if (data.results[0].time_status === '2') {
            if (realtimeData.Summary.status !== 'inprogress') {
              try {
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/status`)
                  .set('inprogress');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP of status on ${betsID} by DY`
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
                    `${err} at doPBP of Match on ${betsID} by DY`
                  )
                );
              }
              try {
                await modules.firestore
                  .collection(firestoreName)
                  .doc(betsID)
                  .set({ flag: { status: 1 } }, { merge: true });
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at doPBP of status by DY`
                  )
                );
              }
            }
          }
          if (data.results[0].time_status === '1') {
            if (realtimeData.Summary.status !== 'inprogress') {
              try {
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/status`)
                  .set('inprogress');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP of status on ${betsID} by DY`
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
                    `${err} at doPBP of status on ${betsID} by DY`
                  )
                );
              }
              try {
                await modules.firestore
                  .collection(firestoreName)
                  .doc(betsID)
                  .set({ flag: { status: 1 } }, { merge: true });
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseCollectError(
                    `${err} at doPBP of status on ${betsID} by DY`
                  )
                );
              }
            }
          }
        }
        let homeScores = 'no data';
        let awayScores = 'no data';

        if (!data.results[0].timer) {
          data.results[0].timer = { tm: 'xx', ts: 'xx' };
        }
        if (!data.results[0].ss) {
          data.results[0].ss = 'no data';
        } else {
          homeScores = data.results[0].ss.split('-')[0];
          awayScores = data.results[0].ss.split('-')[1];
        }
        if (!data.results[0].stats) {
          data.results[0].stats = {};
        }
        if (!data.results[0].stats.attacks) {
          data.results[0].stats.attacks = ['no data', 'no data'];
        }
        if (!data.results[0].stats.ball_safe) {
          data.results[0].stats.ball_safe = ['no data', 'no data'];
        }
        if (!data.results[0].stats.corners) {
          data.results[0].stats.corners = ['no data', 'no data'];
        }
        if (!data.results[0].stats.dangerous_attacks) {
          data.results[0].stats.dangerous_attacks = ['no data', 'no data'];
        }
        if (!data.results[0].stats.goals) {
          data.results[0].stats.goals = ['no data', 'no data'];
        }
        if (!data.results[0].stats.off_target) {
          data.results[0].stats.off_target = ['no data', 'no data'];
        }
        if (!data.results[0].stats.on_target) {
          data.results[0].stats.on_target = ['no data', 'no data'];
        }
        if (!data.results[0].stats.yellowcards) {
          data.results[0].stats.yellowcards = ['no data', 'no data'];
        }
        if (!data.results[0].stats.redcards) {
          data.results[0].stats.redcards = ['no data', 'no data'];
        }

        try {
          await modules.database
            .ref(`esports/eSoccer/${betsID}/Summary/league`)
            .set({
              name: data.results[0].league.name,
              id: data.results[0].league.id
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP of league on ${betsID} by DY`
            )
          );
        }

        try {
          await modules.database
            .ref(`esports/eSoccer/${betsID}/Summary/Now_clock`)
            .set(`${data.results[0].timer.tm}:${data.results[0].timer.ts}`);
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP of now_clock on ${betsID} by DY`
            )
          );
        }
        try {
          await modules.database
            .ref(`esports/eSoccer/${betsID}/Summary/info`)
            .set({
              home: {
                name: data.results[0].home.name,
                Total: {
                  score: homeScores,
                  attacks: data.results[0].stats.attacks[0],
                  ball_safe: data.results[0].stats.ball_safe[0],
                  corners: data.results[0].stats.corners[0],
                  dangerous_attacks: data.results[0].stats.dangerous_attacks[0],
                  goals: data.results[0].stats.goals[0],
                  off_target: data.results[0].stats.off_target[0],
                  on_target: data.results[0].stats.on_target[0],
                  yellowcards: data.results[0].stats.yellowcards[0],
                  redcards: data.results[0].stats.redcards[0]
                }
              },
              away: {
                name: data.results[0].away.name,
                Total: {
                  score: awayScores,
                  attacks: data.results[0].stats.attacks[1],
                  ball_safe: data.results[0].stats.ball_safe[1],
                  corners: data.results[0].stats.corners[1],
                  dangerous_attacks: data.results[0].stats.dangerous_attacks[1],
                  goals: data.results[0].stats.goals[1],
                  off_target: data.results[0].stats.off_target[1],
                  on_target: data.results[0].stats.on_target[1],
                  yellowcards: data.results[0].stats.yellowcards[1],
                  redcards: data.results[0].stats.redcards[1]
                }
              }
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP of info on ${betsID} by DY`
            )
          );
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at pbpESoccer of doPBP on ${betsID} by DY`
        )
      );
    }
    return resolve('ok');
  });
}
module.exports = { ESoccerpbpInplay, ESoccerpbpHistory };
