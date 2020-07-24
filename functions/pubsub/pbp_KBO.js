const modules = require('../util/modules');
const { database } = require('../util/firebaseModules');
const envValues = require('../config/env_values');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
async function KBOpbpInplay(parameter) {
  // 12 秒一次
  const perStep = 12000;
  // 一分鐘4次
  const timesPerLoop = 4;
  const betsID = parameter.betsID;
  let realtimeData;
  if (parameter.realtimeData) {
    realtimeData = parameter.realtimeData;
  } else {
    realtimeData = null;
  }
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${betsID}`;
    const parameterPBP = {
      betsID: betsID,
      pbpURL: pbpURL,
      realtimeData: realtimeData
    };
    await doPBP(parameterPBP);
    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : pbp_KBO success`);
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at KBOpbp by DY`));
    }
  });
}
async function KBOpbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${betsID}`;
    try {
      let data = await axiosForURL(pbpURL);
      let realtimeData;
      let homeScores = null;
      let awayScores = null;
      if (!data.results[0].ss) {
        realtimeData = await database
          .ref(`baseball/KBO/${betsID}`)
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
        homeScores = data.results[0].ss.split('-')[1];
        awayScores = data.results[0].ss.split('-')[0];
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
            `${err} at pbpKBO of Match on ${betsID} by DY`
          )
        );
      }
      try {
        await database
          .ref(`baseball/KBO/${betsID}/Summary/status`)
          .set('closed');
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpKBO of status on ${betsID} by DY`
          )
        );
      }
      try {
        await settleMatchesModel({
          token: {
            uid: '999'
          },
          bets_id: betsID
        });
      } catch (err) {
        return reject(
          new AppErrors.PBPEsoccerError(
            `${err} at pbpKBO of yuhsien on ${betsID} by DY`
          )
        );
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at pbpKBO of PBPHistory on ${betsID} by DY`
        )
      );
    }
    return resolve('ok');
  });
}
async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const realtimeData = parameter.realtimeData;

    try {
      const data = await axiosForURL(pbpURL);
      if (data.results[0]) {
        if (data.results[0].time_status) {
          if (data.results[0].time_status === '5') {
            try {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
                .set('cancelled');
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
                status: -3
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at doPBP of Match on ${betsID} by DY`
                )
              );
            }
          }
          if (data.results[0].time_status === '4') {
            try {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
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
          }

          if (data.results[0].time_status === '3') {
            try {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
                .set('closed');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
          }

          if (data.results[0].time_status === '2') {
            try {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
                .set('tobefixed');
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
                status: -1
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at doPBP of Match on ${betsID} by DY`
                )
              );
            }
          }
          if (data.results[0].time_status === '1') {
            if (realtimeData !== null) {
              if (realtimeData.Summary.status !== 'inprogress') {
                try {
                  await database
                    .ref(`baseball/KBO/${betsID}/Summary/status`)
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
                  await database
                    .ref(`baseball/KBO/${betsID}/Summary/league`)
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
            }
          }
          if (data.results[0].time_status === '0') {
            try {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/status`)
                .set('tobefixed');
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
                status: -1
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            // try {
            //  await firestore
            //    .collection(firestoreName)
            //    .doc(betsID)
            //    .set({ flag: { status: -1 } }, { merge: true });
            // } catch (err) {
            //  return reject(
            //    new AppErrors.FirebaseCollectError(
            //      `${err} at doPBP of status on ${betsID} by DY`
            //    )
            //  );
            // }
          }
          let homeScores = 'no data';
          let awayScores = 'no data';

          if (!data.results[0].ss) {
            data.results[0].ss = 'no data';
          } else {
            homeScores = data.results[0].ss.split('-')[1];
            awayScores = data.results[0].ss.split('-')[0];
          }

          try {
            if (data.results[0].ss !== 'no data') {
              await database
                .ref(`baseball/KBO/${betsID}/Summary/info`)
                .set({
                  home: {
                    name: data.results[0].home.name,
                    Total: {
                      points: homeScores
                    }
                  },
                  away: {
                    name: data.results[0].away.name,
                    Total: {
                      points: awayScores
                    }
                  }
                });
            }
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpKBO of info on ${betsID} by DY`
              )
            );
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.PBPKBOError(
          `${err} at pbpKBO of doPBP on ${betsID} by DY`
        )
      );
    }
    return resolve('ok');
  });
}
module.exports = { KBOpbpInplay, KBOpbpHistory };
