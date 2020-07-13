const modules = require('../util/modules');
const envValues = require('../config/env_values');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const livescore = require('../model/home/livescore');
const leagueOnLivescore = require('../model/home/leagueOnLivescoreModel');
let keepPBP = 1;
const Match = db.Match;
let leagueID;
let leagueName;
let firestoreData;
async function ESoccerpbpInplay(parameter, totalData) {
  leagueName = await leagueOnLivescore();
  leagueID = modules.leagueCodebook(leagueName).id;
  firestoreData = await livescore(totalData);
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
  const timerForStatus2 = setInterval(async function () {
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
  return new Promise(async function (resolve, reject) {
    try {
      const {data} = await modules.axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(new AppErrors.AxiosError(`${err} at pbp_eSoccer by DY`));
    }
  });
}
async function write2HomeLivescore(betsID, timer, homeScores, awayScores) {
  let flag = 0;
  if ((await leagueOnLivescore()) === 'eSoccer') {
    // 寫到realtime
    for (let i = 0; i < firestoreData.length; i++) {
      if (firestoreData[i] === betsID) {
        flag = 1;
      }
    }
    if (flag === 1) {
      try {
        await modules.database.ref(`home_livescore/`).set({
          [`${firestoreData[0].bets_id}`]: {
            id: firestoreData[0].bets_id,
            league: leagueName,
            ori_league: firestoreData[0].league_name_ch,
            sport: modules.league2Sport(leagueName).sport,
            status: firestoreData[0].status,
            scheduled: firestoreData[0].scheduled,
            spread: {
              handicap:
                firestoreData[0].handicap === null
                  ? 'null'
                  : firestoreData[0].handicap,
              home_tw:
                firestoreData[0].home_tw === null
                  ? 'null'
                  : firestoreData[0].home_tw,
              away_tw:
                firestoreData[0].away_tw === null
                  ? 'null'
                  : firestoreData[0].away_tw
            },
            home: {
              teamname:
                firestoreData[0].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[0].home_alias_ch.split('(')[0].trim()
                  : firestoreData[0].home_alias_ch,
              player_name:
                firestoreData[0].home_name.indexOf('(') > 0
                  ? firestoreData[0].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[0].home_name,
              alias: firestoreData[0].home_alias,
              alias_ch:
                firestoreData[0].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[0].home_alias_ch.split('(')[0].trim()
                  : firestoreData[0].home_alias_ch,
              image_id: firestoreData[0].home_image_id
            },
            away: {
              teamname:
                firestoreData[0].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[0].away_alias_ch.split('(')[0].trim()
                  : firestoreData[0].away_alias_ch,
              player_name:
                firestoreData[0].away_name.indexOf('(') > 0
                  ? firestoreData[0].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[0].away_name,
              alias: firestoreData[0].away_alias,
              alias_ch:
                firestoreData[0].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[0].away_alias_ch.split('(')[0].trim()
                  : firestoreData[0].away_alias_ch,
              image_id: firestoreData[0].away_image_id
            },
            Now_clock: timer,
            Summary: {
              info: {
                home: {
                  Total: {points: homeScores}
                },
                away: {
                  Total: {points: awayScores}
                }
              }
            }
          },
          [`${firestoreData[1].bets_id}`]: {
            id: firestoreData[1].bets_id,
            league: leagueName,
            ori_league: firestoreData[1].league_name_ch,
            sport: modules.league2Sport(leagueName).sport,
            status: firestoreData[1].status,
            scheduled: firestoreData[1].scheduled,
            spread: {
              handicap:
                firestoreData[1].handicap === null
                  ? 'null'
                  : firestoreData[1].handicap,
              home_tw:
                firestoreData[1].home_tw === null
                  ? 'null'
                  : firestoreData[1].home_tw,
              away_tw:
                firestoreData[1].away_tw === null
                  ? 'null'
                  : firestoreData[1].away_tw
            },
            home: {
              teamname:
                firestoreData[1].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[1].home_alias_ch.split('(')[0].trim()
                  : firestoreData[1].home_alias_ch,
              player_name:
                firestoreData[1].home_name.indexOf('(') > 0
                  ? firestoreData[1].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[1].home_name,
              alias: firestoreData[1].home_alias,
              alias_ch:
                firestoreData[1].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[1].home_alias_ch.split('(')[0].trim()
                  : firestoreData[1].home_alias_ch,
              image_id: firestoreData[1].home_image_id
            },
            away: {
              teamname:
                firestoreData[1].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[1].away_alias_ch.split('(')[0].trim()
                  : firestoreData[1].away_alias_ch,
              player_name:
                firestoreData[1].away_name.indexOf('(') > 0
                  ? firestoreData[1].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[1].away_name,
              alias: firestoreData[1].away_alias,
              alias_ch:
                firestoreData[1].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[1].away_alias_ch.split('(')[0].trim()
                  : firestoreData[1].away_alias_ch,
              image_id: firestoreData[1].away_image_id
            },
            Now_clock: timer,
            Summary: {
              info: {
                home: {
                  Total: {points: homeScores}
                },
                away: {
                  Total: {points: awayScores}
                }
              }
            }
          },
          [`${firestoreData[2].bets_id}`]: {
            id: firestoreData[2].bets_id,
            league: leagueName,
            ori_league: firestoreData[2].league_name_ch,
            sport: modules.league2Sport(leagueName).sport,
            status: firestoreData[2].status,
            scheduled: firestoreData[2].scheduled,
            spread: {
              handicap:
                firestoreData[2].handicap === null
                  ? 'null'
                  : firestoreData[2].handicap,
              home_tw:
                firestoreData[2].home_tw === null
                  ? 'null'
                  : firestoreData[2].home_tw,
              away_tw:
                firestoreData[2].away_tw === null
                  ? 'null'
                  : firestoreData[2].away_tw
            },
            home: {
              teamname:
                firestoreData[2].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[2].home_alias_ch.split('(')[0].trim()
                  : firestoreData[2].home_alias_ch,
              player_name:
                firestoreData[2].home_name.indexOf('(') > 0
                  ? firestoreData[2].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[2].home_name,
              alias: firestoreData[2].home_alias,
              alias_ch:
                firestoreData[2].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[2].home_alias_ch.split('(')[0].trim()
                  : firestoreData[2].home_alias_ch,
              image_id: firestoreData[2].home_image_id
            },
            away: {
              teamname:
                firestoreData[2].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[2].away_alias_ch.split('(')[0].trim()
                  : firestoreData[2].away_alias_ch,
              player_name:
                firestoreData[2].away_name.indexOf('(') > 0
                  ? firestoreData[2].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[2].away_name,
              alias: firestoreData[2].away_alias,
              alias_ch:
                firestoreData[2].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[2].away_alias_ch.split('(')[0].trim()
                  : firestoreData[2].away_alias_ch,
              image_id: firestoreData[2].away_image_id
            },
            Now_clock: timer,
            Summary: {
              info: {
                home: {
                  Total: {points: homeScores}
                },
                away: {
                  Total: {points: awayScores}
                }
              }
            }
          },
          [`${firestoreData[3].bets_id}`]: {
            id: firestoreData[3].bets_id,
            league: leagueName,
            ori_league: firestoreData[3].league_name_ch,
            sport: modules.league2Sport(leagueName).sport,
            status: firestoreData[3].status,
            scheduled: firestoreData[3].scheduled,
            spread: {
              handicap:
                firestoreData[3].handicap === null
                  ? 'null'
                  : firestoreData[3].handicap,
              home_tw:
                firestoreData[3].home_tw === null
                  ? 'null'
                  : firestoreData[3].home_tw,
              away_tw:
                firestoreData[3].away_tw === null
                  ? 'null'
                  : firestoreData[3].away_tw
            },
            home: {
              teamname:
                firestoreData[3].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[3].home_alias_ch.split('(')[0].trim()
                  : firestoreData[3].home_alias_ch,
              player_name:
                firestoreData[3].home_name.indexOf('(') > 0
                  ? firestoreData[3].home_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[3].home_name,
              alias: firestoreData[3].home_alias,
              alias_ch:
                firestoreData[3].home_alias_ch.indexOf('(') > 0
                  ? firestoreData[3].home_alias_ch.split('(')[0].trim()
                  : firestoreData[3].home_alias_ch,
              image_id: firestoreData[3].home_image_id
            },
            away: {
              teamname:
                firestoreData[3].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[3].away_alias_ch.split('(')[0].trim()
                  : firestoreData[3].away_alias_ch,
              player_name:
                firestoreData[3].away_name.indexOf('(') > 0
                  ? firestoreData[3].away_name
                      .split('(')[1]
                      .replace(')', '')
                      .trim()
                  : null,
              name: firestoreData[3].away_name,
              alias: firestoreData[3].away_alias,
              alias_ch:
                firestoreData[3].away_alias_ch.indexOf('(') > 0
                  ? firestoreData[3].away_alias_ch.split('(')[0].trim()
                  : firestoreData[3].away_alias_ch,
              image_id: firestoreData[3].away_image_id
            },
            Now_clock: timer,
            Summary: {
              info: {
                home: {
                  Total: {points: homeScores}
                },
                away: {
                  Total: {points: awayScores}
                }
              }
            }
          }
        });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpESoccer of doPBP on ${betsID} by DY`
          )
        );
      }
    }
  }
}
async function ESoccerpbpHistory(parameter) {
  return new Promise(async function (resolve, reject) {
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
      realtimeData = await modules.database
        .ref(`esports/eSoccer/${betsID}`)
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
      data.results[0].timer = {tm: 'xx', ts: 'xx'};
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
      await modules.database
        .ref(`esports/eSoccer/${betsID}/Summary/status`)
        .set('closed');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at pbpESoccer of status on ${betsID} by DY`
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
async function doPBP(parameter, firestoreData) {
  return new Promise(async function (resolve, reject) {
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
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/status`)
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
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/status`)
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

          if (data.results[0].time_status === '2') {
            try {
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/status`)
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
            if (realtimeData !== null) {
              if (realtimeData.Summary.status !== 'inprogress') {
                try {
                  await modules.database
                    .ref(`esports/eSoccer/${betsID}/Summary/status`)
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
              }
            }
            keepPBP = 1;
          }
          if (data.results[0].time_status === '0') {
            try {
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/status`)
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
            let homeScores = 'no data';
            let awayScores = 'no data';

            if (!data.results[0].timer) {
              data.results[0].timer = {tm: 'xx', ts: 'xx'};
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
              await modules.database
                .ref(`esports/eSoccer/${betsID}/Summary/Now_clock`)
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
                await modules.database
                  .ref(`esports/eSoccer/${betsID}/Summary/info`)
                  .set({
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
            await write2HomeLivescore(betsID, timer, homeScores, awayScores);
          }
        }
      }
    } else {
      // api error
      try {
        await modules.database
          .ref(`esports/eSoccer/${betsID}/Summary/status`)
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
    return resolve('ok');
  });
}

function timeFormat(tm, ts) {
  if (ts >= 0 && ts <= 9) {
    ts = `0${ts}`;
  }
  return `${tm}:${ts}`;
}

module.exports = {ESoccerpbpInplay, ESoccerpbpHistory};
