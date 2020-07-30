const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const axios = require('axios');
const envValues = require('../config/env_values');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
let keepPBP = 1;

async function AnotherpbpInplay(parameter, sport, league, leagueID) {
  const perStep = 35000;
  const timesPerLoop = 2;
  let countForStatus2 = 0;
  const betsID = parameter.betsID;

  const timerForStatus2 = setInterval(async function() {
    const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${betsID}`;
    const parameterPBP = {
      betsID: betsID,
      pbpURL: pbpURL,
      sport: sport,
      league: league,
      leagueID: leagueID
    };
    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : checkmatch_Another success`);
      clearInterval(timerForStatus2);
    } else {
      await doPBP(parameterPBP);
    }
  }, perStep);
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios(URL);
      return resolve(data);
    } catch (err) {
      try {
        if (err.code === 'ECOUNNRESET') {
          console.log('axios again at pbp_another');
          const { data } = await axios(URL);
          return resolve(data);
        }
      } catch (err) {
        return reject(new AppErrors.AxiosError(`${err} at pbp_another by DY`));
      }
    }
  });
}

async function AnotherpbpHistory(parameter, sport, league, leagueID) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = `https://api.betsapi.com/v1/event/view?token=${envValues.betsToken}&event_id=${betsID}`;
    let data;
    try {
      data = await axiosForURL(pbpURL);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at pbp_another of PBPHistory on ${betsID} by DY`
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

    try {
      if (
        leagueID === 11235 ||
        leagueID === 347 ||
        leagueID === 349 ||
        leagueID === 3939
      ) {
        await Match.upsert({
          bets_id: betsID,
          home_points: awayScores,
          away_points: homeScores,
          status: 0
        });
      } else {
        await Match.upsert({
          bets_id: betsID,
          home_points: homeScores,
          away_points: awayScores,
          status: 0
        });
      }
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
          `${err} at pbpAbnormal of status on ${betsID} by DY`
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

async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const sport = parameter.sport;
    const league = parameter.league;
    const leagueID = parameter.leagueID;
    let data;
    try {
      data = await axiosForURL(pbpURL);
    } catch (err) {
      return reject(
        new AppErrors.PBPEsoccerError(
          `${err} at pbpAnother of doPBP on ${betsID} by DY`
        )
      );
    }
    if (data.results.length > 0) {
      if (data.results[0]) {
        if (data.results[0].time_status) {
          if (data.results[0].time_status === '5') {
            try {
              await database
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
            keepPBP = 0;
          }

          if (data.results[0].time_status === '4') {
            try {
              await database
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
            keepPBP = 0;
          }

          if (data.results[0].time_status === '3') {
            try {
              await database
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
              await database
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
            keepPBP = 0;
          }
          if (data.results[0].time_status === '1') {
            try {
              await database
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
              await Match.upsert({
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
              await database
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
            keepPBP = 1;
          }

          if (data.results[0].time_status === '0') {
            try {
              await database
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
              await Match.upsert({
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
            if (data.results[0].ss) {
              if (
                leagueID === 11235 ||
                leagueID === 347 ||
                leagueID === 349 ||
                leagueID === 3939
              ) {
                try {
                  await database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/home/Total/points`
                    )
                    .set(data.results[0].ss.split('-')[1]);
                  await database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/away/Total/points`
                    )
                    .set(data.results[0].ss.split('-')[0]);
                  if (data.results[0].scores) {
                    for (let inningCount = 1; inningCount < 10; inningCount++) {
                      await database
                        .ref(
                          `${sport}/${league}/${betsID}/Summary/info/home/Innings${inningCount}/scoring/runs`
                        )
                        .set(data.results[0].scores[`${inningCount}`].away);
                      await database
                        .ref(
                          `${sport}/${league}/${betsID}/Summary/info/away/Innings${inningCount}/scoring/runs`
                        )
                        .set(data.results[0].scores[`${inningCount}`].home);
                    }
                  }
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP of status on ${betsID} by DY`
                    )
                  );
                }
              } else if (leagueID === 2319) {
                try {
                  if (data.results[0].timer) {
                    if (data.results[0].timer.ts === '0') {
                      data.results[0].timer.ts = '00';
                    }
                    await database
                      .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
                      .set(
                        `${data.results[0].timer.tm}:${data.results[0].timer.ts}`
                      );
                    await database
                      .ref(`${sport}/${league}/${betsID}/Summary/Now_periods`)
                      .set(`${data.results[0].timer.q - 1}`);
                    if (data.results[0].scores) {
                      await database
                        .ref(
                          `${sport}/${league}/${betsID}/Summary/info/home/periods${data.results[0].timer.q}/points`
                        )
                        .set(
                          `${
                            data.results[0].scores[data.results[0].timer.q].home
                          }`
                        );
                      await database
                        .ref(
                          `${sport}/${league}/${betsID}/Summary/info/away/periods${data.results[0].timer.q}/points`
                        )
                        .set(
                          `${
                            data.results[0].scores[data.results[0].timer.q].away
                          }`
                        );
                    }
                  } else {
                    await database
                      .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
                      .set('xx:xx');
                  }
                  await database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/home/Total/points`
                    )
                    .set(data.results[0].ss.split('-')[0]);
                  await database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/away/Total/points`
                    )
                    .set(data.results[0].ss.split('-')[1]);
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP of status on ${betsID} by DY`
                    )
                  );
                }
              } else {
                try {
                  await database
                    .ref(`${sport}/${league}/${betsID}/Summary/info`)
                    .set({
                      home: { Total: { points: data.results[0].ss.split('-')[0] } },
                      away: { Total: { points: data.results[0].ss.split('-')[1] } }
                    });
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP of status on ${betsID} by DY`
                    )
                  );
                }
              }
            }
          }
        }
      }
    } else {
      try {
        await database
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
  });
}

module.exports = { AnotherpbpInplay, AnotherpbpHistory };