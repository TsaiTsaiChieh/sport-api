const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const axios = require('axios');
const envValues = require('../config/env_values');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const pbpOnHome = require('../model/home/pbpOnHomeModel');
const Match = db.Match;
const sport = 'esports';
const league = 'eSoccer';
async function ESoccerpbpInplay(parameter, Data) {
  const firestoreData = Data;
  // 14 秒一次
  const perStep = 14000;
  // 一分鐘3次
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

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : checkmatch_ESoccer success`);
      clearInterval(timerForStatus2);
    } else {
      await doPBP(parameterPBP, firestoreData);
    }
  }, perStep);
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at pbp_eSoccer by DY`));
    }
  });
}

async function ESoccerpbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${betsID}`;
    let data;
    try {
      data = await axiosForURL(pbpURL);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at pbpESoccer of PBPHistory on ${betsID} by DY`
        )
      );
    }
    let realtimeData;
    let homeScores = null;
    let awayScores = null;
    if (!data.results[0].ss) {
      realtimeData = await database
        .ref(`${sport}/${league}/${betsID}`)
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
      await database
        .ref(`${sport}/${league}/${betsID}/Summary/status`)
        .set('closed');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at pbpESoccer of status on ${betsID} by DY`
        )
      );
    }
    try {
      settleMatchesModel({
        token: {
          uid: '999'
        },
        bets_id: betsID
      });
    } catch (err) {
      console.log(
        'Error in pubsub/pbp_eSoccer on YuHsien by DY:  %o : %o',
        err,
        betsID
      );
      return reject(
        new AppErrors.PBPEsoccerError(
          `${err} at pbpESoccer of yuhsien on ${betsID} by DY`
        )
      );
    }

    return resolve('ok');
  });
}
async function doPBP(parameter, firestoreData) {
  return new Promise(async function(resolve, reject) {
    let keepPBP = 1;
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const realtimeData = parameter.realtimeData;
    let data;
    try {
      data = await axiosForURL(pbpURL);
    } catch (err) {
      return reject(
        new AppErrors.PBPEsoccerError(
          `${err} at pbpESoccer of doPBP on ${betsID} by DY`
        )
      );
    }
    if (data.results.length > 0) {
      if (data.results[0]) {
        if (data.results[0].time_status) {
          if (data.results[0].time_status === '5') {
            try {
              database
                .ref(`${sport}/${league}/${betsID}/Summary/status`)
                .set('cancelled');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            try {
              Match.upsert({
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
            keepPBP = 0;
          }
          if (data.results[0].time_status === '4') {
            try {
              database
                .ref(`${sport}/${league}/${betsID}/Summary/status`)
                .set('postponed');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            try {
              Match.upsert({
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
            keepPBP = 0;
          }

          if (data.results[0].time_status === '3') {
            try {
              database
                .ref(`${sport}/${league}/${betsID}/Summary/status`)
                .set('closed');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseCollectError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            keepPBP = 1;
          }

          if (data.results[0].time_status === '2') {
            try {
              database
                .ref(`${sport}/${league}/${betsID}/Summary/status`)
                .set('tobefixed');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            try {
              Match.upsert({
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
            keepPBP = 0;
          }
          if (data.results[0].time_status === '1') {
            if (realtimeData !== null) {
              if (realtimeData.Summary.status !== 'inprogress') {
                try {
                  database
                    .ref(`${sport}/${league}/${betsID}/Summary/status`)
                    .set('inprogress');
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP of status on ${betsID} by DY(inprogress)`
                    )
                  );
                }
                try {
                  Match.upsert({
                    bets_id: betsID,
                    status: 1
                  });
                } catch (err) {
                  return reject(
                    new AppErrors.MysqlError(
                      `${err.stack} at doPBP of status on ${betsID} by DY(inprogress)`
                    )
                  );
                }

                try {
                  database
                    .ref(`${sport}/${league}/${betsID}/Summary/league`)
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
            keepPBP = 1;
          }
          if (data.results[0].time_status === '0') {
            try {
              database
                .ref(`${sport}/${league}/${betsID}/Summary/status`)
                .set('tobefixed');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP of status on ${betsID} by DY`
                )
              );
            }
            try {
              Match.upsert({
                bets_id: betsID,
                status: -1
              });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(
                  `${err} at doPBP of status on ${betsID} by DY(abnormal)`
                )
              );
            }
            keepPBP = 0;
          }
          if (keepPBP === 1) {
            let homeScores = 'no data';
            let awayScores = 'no data';

            if (!data.results[0].timer) {
              data.results[0].timer = { tm: 'xx', ts: 'xx' };
            }
            if (!data.results[0].ss || data.results[0].ss === null) {
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
            let timer;
            try {
              timer = timeFormat(
                data.results[0].timer.tm,
                data.results[0].timer.ts
              );
              database
                .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
                .set(timer);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP of now_clock on ${betsID} by DY`
                )
              );
            }

            try {
              if (data.results[0].ss !== 'no data') {
                database.ref(`${sport}/${league}/${betsID}/Summary/info`).set({
                  home: {
                    name: data.results[0].home.name,
                    Total: {
                      points: homeScores,
                      attacks: data.results[0].stats.attacks[0],
                      ball_safe: data.results[0].stats.ball_safe[0],
                      corners: data.results[0].stats.corners[0],
                      dangerous_attacks:
                        data.results[0].stats.dangerous_attacks[0],
                      off_target: data.results[0].stats.off_target[0],
                      on_target: data.results[0].stats.on_target[0],
                      yellowcards: data.results[0].stats.yellowcards[0],
                      redcards: data.results[0].stats.redcards[0]
                    }
                  },
                  away: {
                    name: data.results[0].away.name,
                    Total: {
                      points: awayScores,
                      attacks: data.results[0].stats.attacks[1],
                      ball_safe: data.results[0].stats.ball_safe[1],
                      corners: data.results[0].stats.corners[1],
                      dangerous_attacks:
                        data.results[0].stats.dangerous_attacks[1],
                      off_target: data.results[0].stats.off_target[1],
                      on_target: data.results[0].stats.on_target[1],
                      yellowcards: data.results[0].stats.yellowcards[1],
                      redcards: data.results[0].stats.redcards[1]
                    }
                  }
                });
              }
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP of info on ${betsID} by DY`
                )
              );
            }
            const sportInfo = {
              sport: sport,
              timer: timer
            };
            if (firestoreData !== null) {
              if (firestoreData.length > 0) {
                for (let fi = 0; fi < firestoreData.length; fi++) {
                  if (firestoreData[fi].bets_id === betsID) {
                    pbpOnHome.pbpOnHome(
                      betsID,
                      sportInfo,
                      homeScores,
                      awayScores
                    );
                    break;
                  }
                }
              }
            }
          }
        }
      }
    } else {
      // api error
      try {
        database
          .ref(`${sport}/${league}/${betsID}/Summary/status`)
          .set('tobefixed');
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at doPBP of status on ${betsID} by DY`
          )
        );
      }
      try {
        Match.upsert({
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

    return resolve('ok');
  });
}

function timeFormat(tm, ts) {
  if (ts >= 0 && ts <= 9) {
    ts = `0${ts}`;
  }
  return `${tm}:${ts}`;
}

module.exports = { ESoccerpbpInplay, ESoccerpbpHistory };
