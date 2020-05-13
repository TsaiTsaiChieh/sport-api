const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const firestoreArray = ['pagetest_eSoccer'];
const sportArray = ['esports'];
const leagueArray = ['eSoccer'];
async function checkmatch_abnormal() {
  return new Promise(async function(resolve, reject) {
    for (let i = 0; i < firestoreArray.length; i++) {
      const firestoreName = firestoreArray[i];
      const sportName = sportArray[i];
      const leagueName = leagueArray[i];
      try {
        const data = await modules.firestore
          .collection(firestoreName)
          .where('flag.status', '==', -1)
          .get();
        const totalData = [];
        data.forEach((doc) => {
          totalData.push(doc.data());
        });
        for (let i = 0; i < totalData.length; i++) {
          const betsID = totalData[i].bets_id;
          const pbpURL = `https://api.betsapi.com/v1/event/view?token=${modules.betsToken}&event_id=${betsID}`;
          const parameterPBP = {
            betsID: betsID,
            pbpURL: pbpURL,
            sportName: sportName,
            leagueName: leagueName,
            firestoreName: firestoreName
          };
          await doPBP(parameterPBP);
        }
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at checkmatch_abnormal by DY`
          )
        );
      }
    }
    return resolve('ok');
  });
}
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at checkmatch_abnormal by DY`)
      );
    }
  });
}
async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const sportName = parameter.sportName;
    const leagueName = parameter.leagueName;
    const firestoreName = parameter.firestoreName;
    try {
      const data = await axiosForURL(pbpURL);
      if (data.results[0]) {
        if (data.results[0].time_status) {
          if (data.results[0].time_status === '5') {
            try {
              await modules.database
                .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                .set('cancelled');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at checkmatch_abnormal of status on ${betsID} by DY`
                )
              );
            }
            try {
              await Match.upsert({
                bets_id: betsID,
                status: -3
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at checkmatch_abnormal of Match on ${betsID} by DY`
                )
              );
            }
            try {
              await modules.firestore
                .collection(firestoreName)
                .doc(betsID)
                .set({ flag: { status: -3 } }, { merge: true });
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at checkmatch_abnormal of status by DY`
                )
              );
            }
          }
          if (data.results[0].time_status === '4') {
            try {
              await modules.database
                .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
                .set('postponed');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            try {
              await Match.upsert({
                bets_id: betsID,
                status: -2
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
                .set({ flag: { status: -2 } }, { merge: true });
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at doPBP of status by DY`
                )
              );
            }
          }
          if (data.results[0].time_status === '3') {
            try {
              const parameterHistory = {
                betsID: betsID,
                sportName: sportName,
                leagueName: leagueName,
                firestoreName: firestoreName,
                data: data
              };
              await pbpHistory(parameterHistory);
            } catch (err) {
              return reject(
                new AppErrors.PBPAbnormalError(
                  `${err} at pbpHistory on ${betsID} by DY`
                )
              );
            }
          }
          //
          if (data.results[0].time_status === '2') {
            console.log(`${betsID} status is still -1`);
          }
          if (data.results[0].time_status === '1') {
            try {
              await modules.database
                .ref(`${sportName}/${leagueName}/${betsID}/Summary/status`)
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
            try {
              await modules.database
                .ref(`${sportName}/${leagueName}/${betsID}/Summary/league`)
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
          }
          if (data.results[0].time_status === '0') {
            console.log(`${betsID} status is still -1`);
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.PBPAbnormalError(
          `${err} at checkmatch_abnormal of doPBP on ${betsID} by DY`
        )
      );
    }
    return resolve('ok');
  });
}
async function pbpHistory(parameterHistory) {
  return new Promise(async function(resolve, reject) {
    let data = parameterHistory.data;
    const betsID = parameterHistory.betsID;
    const sportName = parameterHistory.sportName;
    const leagueName = parameterHistory.leagueName;
    const firestoreName = parameterHistory.firestoreName;
    let realtimeData;
    let homeScores = 'no data';
    let awayScores = 'no data';
    if (leagueName === 'eSoccer') {
      if (!data.results[0].ss) {
        realtimeData = await modules.database
          .ref(`${sportName}/${leagueName}/${betsID}`)
          .once('value');
        realtimeData = realtimeData.val();
        data = realtimeData;
        data.results[0].ss = 'no data';
        if (!realtimeData.Summary.info.home.Total.points) {
          homeScores = -99;
          awayScores = -99;
        } else {
          homeScores = realtimeData.Summary.info.home.Total.points;
          awayScores = realtimeData.Summary.info.away.Total.points;
        }
      } else {
        homeScores = data.results[0].ss.split('-')[0];
        awayScores = data.results[0].ss.split('-')[1];
      }
      if (!data.results[0].timer) {
        data.results[0].timer = { tm: 'xx', ts: 'xx' };
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
    }

    try {
      await modules.firestore
        // here
        .collection(firestoreName)
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
        new AppErrors.MysqlError(
          `${err} at pbpESoccer of Match on ${betsID} by DY`
        )
      );
    }
    try {
      await modules.database
        .ref(`${sportName}/${leagueName}${betsID}/Summary/status`)
        .set('closed');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at pbpESoccer of status on ${betsID} by DY`
        )
      );
    }
    try {
      //   await modules.firestore
      //     .collection(`${firestoreName}_PBP`)
      //     .doc(betsID)
      //     .set(
      //       {
      //         league: {
      //           name: data.results[0].league.name,
      //           id: data.results[0].league.id
      //         },
      //         Now_clock: `${data.results[0].timer.tm}:${data.results[0].timer.ts}`,
      //         home: {
      //           name: data.results[0].home.name,
      //           Total: {
      //             points: homeScores,
      //             attacks: data.results[0].stats.attacks[0],
      //             ball_safe: data.results[0].stats.ball_safe[0],
      //             corners: data.results[0].stats.corners[0],
      //             dangerous_attacks: data.results[0].stats.dangerous_attacks[0],
      //             goals: data.results[0].stats.goals[0],
      //             off_target: data.results[0].stats.off_target[0],
      //             on_target: data.results[0].stats.on_target[0],
      //             yellowcards: data.results[0].stats.yellowcards[0],
      //             redcards: data.results[0].stats.redcards[0]
      //           }
      //         },
      //         away: {
      //           name: data.results[0].away.name,
      //           Total: {
      //             points: awayScores,
      //             attacks: data.results[0].stats.attacks[1],
      //             ball_safe: data.results[0].stats.ball_safe[1],
      //             corners: data.results[0].stats.corners[1],
      //             dangerous_attacks: data.results[0].stats.dangerous_attacks[1],
      //             goals: data.results[0].stats.goals[1],
      //             off_target: data.results[0].stats.off_target[1],
      //             on_target: data.results[0].stats.on_target[1],
      //             yellowcards: data.results[0].stats.yellowcards[1],
      //             redcards: data.results[0].stats.redcards[1]
      //           }
      //         }
      //       },
      //       { merge: true }
      //     );
      // settlementAccordingMatch(); 采潔的結算

      await settleMatchesModel({
        token: {
          uid: '999'
        },
        bets_id: betsID
      });
    } catch (err) {
      return reject(
        new AppErrors.PBPAbnormalError(`${err} at pbpHistory of yuhsien by DY`)
      );
    }

    return resolve('ok');
  });
}
module.exports = checkmatch_abnormal;
