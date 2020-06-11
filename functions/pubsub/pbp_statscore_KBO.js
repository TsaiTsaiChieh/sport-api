const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
let eventNow = 0;
let nowHitterHome = 0;
let nowHitterAway = 0;
let nowPitcherHome = 0;
let nowPitcherAway = 0;
async function KBOpbpInplay(parameter) {
  // 12 秒一次
  const perStep = 12000;
  // 一分鐘4次，則需設定為5

  const timesPerLoop = 2;
  const betsID = parameter.betsID;
  const statscoreID = parameter.statscoreID;
  let realtimeData;
  if (parameter.realtimeData !== null) {
    realtimeData = parameter.realtimeData;
  } else {
    realtimeData = null;
  }
  if (realtimeData) {
    if (realtimeData.Summary.info) {
      if (realtimeData.Summary.Livetext) {
        eventNow = Object.keys(realtimeData.Summary.Livetext).length;
      }
      if (realtimeData.Summary.Now_hitter_home) {
        nowHitterHome = realtimeData.Summary.Now_hitter_home;
      }
      if (realtimeData.Summary.Now_pitcher_home) {
        nowPitcherHome = realtimeData.Summary.Now_pitcher_home;
      }
      if (realtimeData.Summary.Now_hitter_away) {
        nowHitterAway = realtimeData.Summary.Now_hitter_away;
      }
      if (realtimeData.Summary.Now_pitcher_away) {
        nowPitcherAway = realtimeData.Summary.Now_pitcher_away;
      }
    }
  }
  const token = await queryForToken();
  const pbpURL = `https://api.statscore.com/v2/events/${statscoreID}?token=${token[0].token}`;
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    const parameterPBP = {
      betsID: betsID,
      pbpURL: pbpURL,
      realtimeData: realtimeData
    };

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : pbp_statscore_KBO success`);
      clearInterval(timerForStatus2);
    } else {
      await doPBP(parameterPBP);
    }
  }, perStep);
}

async function KBOpbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    try {
      const betsID = parameter.betsID;
      const statscoreID = parameter.statscoreID;
      const token = await queryForToken();
      const pbpURL = `https://api.statscore.com/v2/events/${statscoreID}?token=${token[0].token}`;

      const data = await axiosForURL(pbpURL);

      const homeScores =
        data.api.data.competition.season.stage.group.event.participants[0]
          .results[2].value;
      const awayScores =
        data.api.data.competition.season.stage.group.event.participants[1]
          .results[2].value;
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
        await modules.database
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
        new AppErrors.AxiosError(`${err} at pbpKBO of PBPHistory on by DY`)
      );
    }
    return resolve('ok');
  });
}

async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    let realtimeData = parameter.realtimeData;
    let pbpFlag = 1;
    try {
      const data = await axiosForURL(pbpURL);

      if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'finished'
      ) {
        try {
          await modules.database
            .ref(`baseball/KBO/${betsID}/Summary/status`)
            .set('closed');
        } catch (err) {
          return reject(
            new AppErrors.FirebaseCollectError(
              `${err} at doPBP of status on ${betsID} by DY`
            )
          );
        }
      } else if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'live'
      ) {
        if (realtimeData !== null) {
          if (realtimeData.Summary.status !== 'inprogress') {
            try {
              await modules.database
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
          }
        }
      } else if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'Postponed'
      ) {
        try {
          await modules.database
            .ref(`baseball/KBO/${betsID}/Summary/status`)
            .set('postponed');
          await Match.upsert({
            bets_id: betsID,
            status: -2
          });
          pbpFlag = 0;
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP of status on ${betsID} by DY`
            )
          );
        }
      } else if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'Cancelled'
      ) {
        try {
          await modules.database
            .ref(`baseball/KBO/${betsID}/Summary/status`)
            .set('cancelled');
          await Match.upsert({
            bets_id: betsID,
            status: -3
          });
          pbpFlag = 0;
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP of status on ${betsID} by DY`
            )
          );
        }
      } else {
        try {
          await modules.database
            .ref(`baseball/KBO/${betsID}/Summary/status`)
            .set('tobefixed');
          await Match.upsert({
            bets_id: betsID,
            status: -1
          });
          pbpFlag = 0;
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP of status on ${betsID} by DY`
            )
          );
        }
      }
      const homeID =
        data.api.data.competition.season.stage.group.event.participants[0].id;
      if (!realtimeData.Summary.info) {
        await modules.database
          .ref(`baseball/KBO/${betsID}/Summary/info/home/name`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .name
          );
        await modules.database
          .ref(`baseball/KBO/${betsID}/Summary/info/away/name`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[1]
              .name
          );
      }
      if (pbpFlag === 1) {
        try {
          await modules.database
            .ref(`baseball/KBO/${betsID}/Summary/info/home/Total`)
            .set({
              points:
                data.api.data.competition.season.stage.group.event
                  .participants[0].results[2].value,
              hits:
                data.api.data.competition.season.stage.group.event
                  .participants[0].stats[0].value,
              errors:
                data.api.data.competition.season.stage.group.event
                  .participants[0].stats[1].value
            });

          await modules.database
            .ref(`baseball/KBO/${betsID}/Summary/info/away/Total`)
            .set({
              points:
                data.api.data.competition.season.stage.group.event
                  .participants[1].results[2].value,
              hits:
                data.api.data.competition.season.stage.group.event
                  .participants[1].stats[0].value,
              errors:
                data.api.data.competition.season.stage.group.event
                  .participants[1].stats[1].value
            });
        } catch (err) {
          return reject(
            new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
          );
        }
        for (let count = 3; count < 26; count++) {
          try {
            if (
              data.api.data.competition.season.stage.group.event.participants[0]
                .results[count].value !== ''
            ) {
              await modules.database
                .ref(
                  `baseball/KBO/${betsID}/Summary/info/home/Innings${count - 2}`
                )
                .set({
                  scoring: {
                    runs:
                      data.api.data.competition.season.stage.group.event
                        .participants[0].results[count].value
                  }
                });
            }
            if (
              data.api.data.competition.season.stage.group.event.participants[1]
                .results[count].value !== ''
            ) {
              await modules.database
                .ref(
                  `baseball/KBO/${betsID}/Summary/info/away/Innings${count - 2}`
                )
                .set({
                  scoring: {
                    runs:
                      data.api.data.competition.season.stage.group.event
                        .participants[1].results[count].value
                  }
                });
            }
          } catch (err) {
            return reject(
              new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
            );
          }
        }

        // 打擊陣容
        if (!realtimeData.Summary.info) {
          const homeLineup = data.api.data.competition.season.stage.group.event.participants[0].lineups.sort(
            function(a, b) {
              return a.id > b.id ? 1 : -1;
            }
          );
          const awayLineup = data.api.data.competition.season.stage.group.event.participants[1].lineups.sort(
            function(a, b) {
              return a.id > b.id ? 1 : -1;
            }
          );
          for (let playercount = 0; playercount < 9; playercount++) {
            try {
              await modules.database
                .ref(
                  `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${
                    playercount + 1
                  }`
                )
                .set({
                  ab: 0,
                  h: 0,
                  name: homeLineup[playercount].participant_name,
                  jersey_number: homeLineup[playercount].shirt_nr,
                  order: playercount + 1,
                  id: homeLineup[playercount].id,
                  start: 1
                });
              await modules.database
                .ref(
                  `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${
                    playercount + 1
                  }`
                )
                .set({
                  ab: 0,
                  h: 0,
                  name: awayLineup[playercount].participant_name,
                  jersey_number: awayLineup[playercount].shirt_nr,
                  order: playercount + 1,
                  id: awayLineup[playercount].id,
                  start: 1
                });
            } catch (err) {
              return reject(
                new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
              );
            }
          }
          try {
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_hitter_home`)
              .set(0);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Next1_hitter_home`)
              .set(1);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Next2_hitter_home`)
              .set(2);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_hitter_away`)
              .set(0);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Next1_hitter_away`)
              .set(1);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Next2_hitter_away`)
              .set(2);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_member_home`)
              .set(11);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_member_away`)
              .set(11);
            // 投手
            await modules.database
              .ref(
                `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup10`
              )
              .set({
                strikes: 0,
                balls: 0,
                er: 0,
                h: 0,
                ip: 0,
                k: 0,
                name: homeLineup[9].participant_name,
                jersey_number: homeLineup[9].shirt_nr,
                order: 10,
                id: homeLineup[9].id,
                start: 1
              });
            await modules.database
              .ref(
                `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup10`
              )
              .set({
                strikes: 0,
                balls: 0,
                er: 0,
                h: 0,
                ip: 0,
                k: 0,
                name: awayLineup[9].participant_name,
                jersey_number: awayLineup[9].shirt_nr,
                order: 10,
                id: awayLineup[9].id,
                start: 1
              });
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_pitcher_home`)
              .set(10);
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_pitcher_away`)
              .set(10);
            // 教練
            await modules.database
              .ref(
                `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup0`
              )
              .set({
                name: homeLineup[10].participant_name
              });
            await modules.database
              .ref(
                `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup0`
              )
              .set({
                name: awayLineup[10].participant_name
              });
          } catch (err) {
            return reject(
              new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
            );
          }
        }

        // 文字直播
        const totalEvent =
          data.api.data.competition.season.stage.group.event.events_incidents
            .length;
        // here
        for (let eventCount = eventNow; eventCount < totalEvent; eventCount++) {
          realtimeData = await modules.database
            .ref(`baseball/KBO/${betsID}`)
            .once('value');
          realtimeData = realtimeData.val();

          if (realtimeData.Summary.Livetext) {
            eventNow = Object.keys(realtimeData.Summary.Livetext).length;
          }
          if (realtimeData.Summary.Now_hitter_home) {
            nowHitterHome = realtimeData.Summary.Now_hitter_home;
          }
          if (realtimeData.Summary.Now_pitcher_home) {
            nowPitcherHome = realtimeData.Summary.Now_pitcher_home;
          }
          if (realtimeData.Summary.Now_hitter_away) {
            nowHitterAway = realtimeData.Summary.Now_hitter_away;
          }
          if (realtimeData.Summary.Now_pitcher_away) {
            nowPitcherAway = realtimeData.Summary.Now_pitcher_away;
          }
          try {
            const inningNow = changeInning(
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].event_status_name
            );
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Livetext/event${eventCount}`)
              .set({
                description:
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_name +
                  ' ' +
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].incident_name,
                Inning: inningNow,
                Half:
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === null
                    ? 'common'
                    : data.api.data.competition.season.stage.group.event
                      .events_incidents[eventCount].participant_id ===
                        homeID &&
                      data.api.data.competition.season.stage.group.event
                        .events_incidents[eventCount].incident_id !== 503 &&
                      data.api.data.competition.season.stage.group.event
                        .events_incidents[eventCount].incident_id !== 504
                      ? '1'
                      : '0'
              });
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 563
            ) {
              let resetFlag = 0;
              try {
                if (
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                ) {
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                    .set(
                      data.api.data.competition.season.stage.group.event
                        .events_incidents[eventCount].participant_id === homeID
                        ? '1'
                        : '0'
                    );
                  // 主隊換下一棒, now_hitter_home + 1
                  nowHitterHome =
                    nowHitterHome + 1 === 9 ? 9 : (nowHitterHome + 1) % 9;
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Now_hitter_home`)
                    .set(nowHitterHome);
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Next1_hitter_home`)
                    .set(nowHitterHome + 1 === 9 ? 9 : (nowHitterHome + 1) % 9);
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Next2_hitter_home`)
                    .set(nowHitterHome + 2 === 9 ? 9 : (nowHitterHome + 2) % 9);

                  if (
                    data.api.data.competition.season.stage.group.event
                      .events_incidents[eventCount].participant_name !== ''
                  ) {
                    if (realtimeData.Summary.info) {
                      if (
                        data.api.data.competition.season.stage.group.event
                          .events_incidents[eventCount].participant_name !==
                        realtimeData.Summary.info.home.Now_lineup[
                          `lineup${nowHitterHome}`
                        ].name
                      ) {
                        resetFlag = 1;
                        const homeLineup = data.api.data.competition.season.stage.group.event.participants[0].lineups.sort(
                          function(a, b) {
                            return a.id > b.id ? 1 : -1;
                          }
                        );

                        // 有代打情況
                        // 將原來order的打擊手移到新的index
                        await modules.database
                          .ref(
                            `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${realtimeData.Summary.Now_member_home}`
                          )
                          .set(
                            realtimeData.Summary.info.home.Now_lineup[
                              `lineup${nowHitterHome}`
                            ]
                          );
                        // 將新的打擊手移到目前的order上
                        await modules.database
                          .ref(
                            `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowHitterHome}`
                          )
                          .set({
                            ab: 0,
                            h: 0,
                            id:
                              homeLineup[realtimeData.Summary.Now_member_home]
                                .id,
                            jersey_number:
                              homeLineup[realtimeData.Summary.Now_member_home]
                                .shirt_nr,
                            name:
                              homeLineup[realtimeData.Summary.Now_member_home]
                                .participant_name,
                            order: nowHitterHome,
                            start: 0
                          });
                        await modules.database
                          .ref(`baseball/KBO/${betsID}/Summary/Now_member_home`)
                          .set(realtimeData.Summary.Now_member_home + 1);
                      }
                    }
                  }
                } else {
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                    .set(
                      data.api.data.competition.season.stage.group.event
                        .events_incidents[eventCount].participant_id === homeID
                        ? '1'
                        : '0'
                    );
                  // 客隊換下一棒, now_hitter_away + 1
                  nowHitterAway =
                    nowHitterAway + 1 === 9 ? 9 : (nowHitterAway + 1) % 9;
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Now_hitter_away`)
                    .set(nowHitterAway);
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Next1_hitter_away`)
                    .set(nowHitterAway + 1 === 9 ? 9 : (nowHitterAway + 1) % 9);
                  await modules.database
                    .ref(`baseball/KBO/${betsID}/Summary/Next2_hitter_away`)
                    .set(nowHitterAway + 2 === 9 ? 9 : (nowHitterAway + 2) % 9);
                  if (
                    data.api.data.competition.season.stage.group.event
                      .events_incidents[eventCount].participant_name !== ''
                  ) {
                    if (realtimeData.Summary.info) {
                      if (
                        data.api.data.competition.season.stage.group.event
                          .events_incidents[eventCount].participant_name !==
                        realtimeData.Summary.info.away.Now_lineup[
                          `lineup${nowHitterAway}`
                        ].name
                      ) {
                        resetFlag = 1;
                        const awayLineup = data.api.data.competition.season.stage.group.event.participants[1].lineups.sort(
                          function(a, b) {
                            return a.id > b.id ? 1 : -1;
                          }
                        );
                        // 有代打情況
                        // 將原來order的打擊手移到新的index
                        await modules.database
                          .ref(
                            `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${realtimeData.Summary.Now_member_away}`
                          )
                          .set(
                            realtimeData.Summary.info.away.Now_lineup[
                              `lineup${nowHitterAway}`
                            ]
                          );
                        // 將新的打擊手移到目前的order上
                        await modules.database
                          .ref(
                            `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowHitterAway}`
                          )
                          .set({
                            ab: 0,
                            h: 0,
                            id:
                              awayLineup[realtimeData.Summary.Now_member_away]
                                .id,
                            jersey_number:
                              awayLineup[realtimeData.Summary.Now_member_away]
                                .shirt_nr,
                            name:
                              awayLineup[realtimeData.Summary.Now_member_away]
                                .participant_name,
                            order: nowHitterAway,
                            start: 0
                          });
                        await modules.database
                          .ref(`baseball/KBO/${betsID}/Summary/Now_member_away`)
                          .set(realtimeData.Summary.Now_member_away + 1);
                      }
                    }
                  }
                }
                await modules.database
                  .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                  .set(
                    data.api.data.competition.season.stage.group.event
                      .events_incidents[eventCount].participant_id === homeID
                      ? '1'
                      : '0'
                  );
                if (
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                ) {
                  if (realtimeData.Summary.info) {
                    if (resetFlag === 0) {
                      await modules.database
                        .ref(
                          `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowHitterHome}/ab`
                        )
                        .set(
                          realtimeData.Summary.info.home.Now_lineup[
                            `lineup${nowHitterHome}`
                          ].ab + 1
                        );
                    } else {
                      await modules.database
                        .ref(
                          `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowHitterHome}/ab`
                        )
                        .set(1);
                    }
                  }
                } else {
                  if (realtimeData.Summary.info) {
                    if (resetFlag === 0) {
                      await modules.database
                        .ref(
                          `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowHitterAway}/ab`
                        )
                        .set(
                          realtimeData.Summary.info.away.Now_lineup[
                            `lineup${nowHitterAway}`
                          ].ab + 1
                        );
                    } else {
                      await modules.database
                        .ref(
                          `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowHitterAway}/ab`
                        )
                        .set(1);
                    }
                  }
                }
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
                );
              }
            }
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 559
            ) {
              try {
                // 交換投手, now_pitcher = 最新的那個人
                if (
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                ) {
                  if (realtimeData.Summary.info) {
                    await modules.database
                      .ref(`baseball/KBO/${betsID}/Summary/Now_pitcher_home`)
                      .set(realtimeData.Summary.Now_member_home);
                    const homeLineup = data.api.data.competition.season.stage.group.event.participants[0].lineups.sort(
                      function(a, b) {
                        return a.id > b.id ? 1 : -1;
                      }
                    );
                    await modules.database
                      .ref(
                        `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${realtimeData.Summary.Now_member_home}`
                      )
                      .set({
                        balls: 0,
                        er: 0,
                        h: 0,
                        id: homeLineup[realtimeData.Summary.Now_member_home].id,
                        ip: 0,
                        jersey_number:
                          homeLineup[realtimeData.Summary.Now_member_home]
                            .shirt_nr,
                        k: 0,
                        name:
                          homeLineup[realtimeData.Summary.Now_member_home]
                            .participant_name,
                        order: realtimeData.Summary.Now_member_home,
                        start: 0,
                        strikes: 0
                      });
                    await modules.database
                      .ref(`baseball/KBO/${betsID}/Summary/Now_member_home`)
                      .set(realtimeData.Summary.Now_member_home + 1);
                  }
                } else {
                  if (realtimeData.Summary.info) {
                    await modules.database
                      .ref(`baseball/KBO/${betsID}/Summary/Now_pitcher_away`)
                      .set(nowPitcherAway);
                    const awayLineup = data.api.data.competition.season.stage.group.event.participants[1].lineups.sort(
                      function(a, b) {
                        return a.id > b.id ? 1 : -1;
                      }
                    );
                    await modules.database
                      .ref(
                        `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${realtimeData.Summary.Now_member_away}`
                      )
                      .set({
                        balls: 0,
                        er: 0,
                        h: 0,
                        id: awayLineup[realtimeData.Summary.Now_member_away].id,
                        ip: 0,
                        jersey_number:
                          awayLineup[realtimeData.Summary.Now_member_away]
                            .shirt_nr,
                        k: 0,
                        name:
                          awayLineup[realtimeData.Summary.Now_member_away]
                            .participant_name,
                        order: realtimeData.Summary.Now_member_away,
                        start: 0,
                        strikes: 0
                      });

                    await modules.database
                      .ref(`baseball/KBO/${betsID}/Summary/Now_member_away`)
                      .set(realtimeData.Summary.Now_member_away + 1);
                  }
                }
              } catch (err) {
                return reject(
                  new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
                );
              }
            }
            // 得分
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 501
            ) {
              await modules.database
                .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                .set(
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                    ? '1'
                    : '0'
                );
              if (
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
              ) {
                // 客隊投手er+1
                await modules.database
                  .ref(
                    `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/er`
                  )
                  .set(
                    realtimeData.Summary.info.away.Now_lineup[
                      `lineup${nowPitcherAway}`
                    ].er + 1
                  );
              } else {
                // 主隊投手er+1
                await modules.database
                  .ref(
                    `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/er`
                  )
                  .set(
                    realtimeData.Summary.info.home.Now_lineup[
                      `lineup${nowPitcherHome}`
                    ].er + 1
                  );
              }
            }

            // 三振
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 520
            ) {
              await modules.database
                .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                .set(
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                    ? '1'
                    : '0'
                );
              if (
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
              ) {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/k`
                    )
                    .set(
                      realtimeData.Summary.info.home.Now_lineup[
                        `lineup${nowPitcherHome}`
                      ].k + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/k`
                    )
                    .set(1);
                }
              } else {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/k`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${nowPitcherAway}`
                      ].k + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/k`
                    )
                    .set(1);
                }
              }
            }
            // h
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 562
            ) {
              await modules.database
                .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                .set(
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                    ? '1'
                    : '0'
                );
              if (
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
              ) {
                // 主隊打擊手h+1
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowHitterHome}/h`
                    )
                    .set(
                      realtimeData.Summary.info.home.Now_lineup[
                        `lineup${nowHitterHome}`
                      ].h + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowHitterHome}/h`
                    )
                    .set(1);
                }
                // 客隊投手h+1
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/h`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${nowPitcherAway}`
                      ].h + 1
                    );

                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/h`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${nowPitcherAway}`
                      ].h + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/h`
                    )
                    .set(1);

                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/h`
                    )
                    .set(1);
                }
              } else {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowHitterAway}/h`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${nowHitterAway}`
                      ].h + 1
                    );
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/h`
                    )
                    .set(
                      realtimeData.Summary.info.home.Now_lineup[
                        `lineup${nowPitcherHome}`
                      ].h + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowHitterAway}/h`
                    )
                    .set(1);
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/h`
                    )
                    .set(1);
                }
              }
            }

            // 好球
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 503
            ) {
              await modules.database
                .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                .set(
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                    ? '0'
                    : '1'
                );
              if (
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
              ) {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/strikes`
                    )
                    .set(
                      realtimeData.Summary.info.home.Now_lineup[
                        `lineup${nowPitcherHome}`
                      ].strikes + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/strikes`
                    )
                    .set(1);
                }
              } else {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/strikes`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${nowPitcherAway}`
                      ].strikes + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/strikes`
                    )
                    .set(1);
                }
              }
            }
            // 壞球
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_id === 504
            ) {
              await modules.database
                .ref(`baseball/KBO/${betsID}/Summary/Now_halfs`)
                .set(
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id === homeID
                    ? '0'
                    : '1'
                );
              if (
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
              ) {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/balls`
                    )
                    .set(
                      realtimeData.Summary.info.home.Now_lineup[
                        `lineup${nowPitcherHome}`
                      ].balls + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/home/Now_lineup/lineup${nowPitcherHome}/balls`
                    )
                    .set(1);
                }
              } else {
                if (realtimeData.Summary.info) {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/balls`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${nowPitcherAway}`
                      ].balls + 1
                    );
                } else {
                  await modules.database
                    .ref(
                      `baseball/KBO/${betsID}/Summary/info/away/Now_lineup/lineup${nowPitcherAway}/balls`
                    )
                    .set(1);
                }
              }
            }
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_innings`)
              .set(inningNow);

            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_strikes`)
              .set(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
                  ? data.api.data.competition.season.stage.group.event
                    .participants[0].stats[17].value
                  : data.api.data.competition.season.stage.group.event
                    .participants[1].stats[17].value
              );
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_outs`)
              .set(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
                  ? data.api.data.competition.season.stage.group.event
                    .participants[0].stats[18].value
                  : data.api.data.competition.season.stage.group.event
                    .participants[1].stats[18].value
              );
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_balls`)
              .set(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
                  ? data.api.data.competition.season.stage.group.event
                    .participants[0].stats[19].value
                  : data.api.data.competition.season.stage.group.event
                    .participants[1].stats[19].value
              );
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_firstbase`)
              .set(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
                  ? parseFloat(
                    data.api.data.competition.season.stage.group.event
                      .participants[0].stats[20].value
                  )
                  : parseFloat(
                    data.api.data.competition.season.stage.group.event
                      .participants[1].stats[20].value
                  )
              );
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_secondbase`)
              .set(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
                  ? parseFloat(
                    data.api.data.competition.season.stage.group.event
                      .participants[0].stats[21].value
                  )
                  : parseFloat(
                    data.api.data.competition.season.stage.group.event
                      .participants[1].stats[21].value
                  )
              );
            await modules.database
              .ref(`baseball/KBO/${betsID}/Summary/Now_thirdbase`)
              .set(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_id === homeID
                  ? parseFloat(
                    data.api.data.competition.season.stage.group.event
                      .participants[0].stats[22].value
                  )
                  : parseFloat(
                    data.api.data.competition.season.stage.group.event
                      .participants[1].stats[22].value
                  )
              );
          } catch (err) {
            return reject(
              new AppErrors.MysqlError(`${err} at doPBP on ${betsID} by DY`)
            );
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseCollectError(`${err} at doPBP on ${betsID} by DY`)
      );
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
        new AppErrors.AxiosError(`${err} at checkmatch_statscore_KBO by DY`)
      );
    }
  });
}

async function queryForToken() {
  return new Promise(async function(resolve, reject) {
    try {
      const queries = await db.sequelize.query(
        // take 169 ms
        `(
					SELECT token
					  FROM tokens
					 WHERE tokens.name='statscore'
				)`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      return resolve(queries);
    } catch (err) {
      return reject(`${err.stack} by DY`);
    }
  });
}

function changeInning(inning) {
  let inningNow = 0;
  switch (inning) {
    case '1st inning': {
      inningNow = 1;
      break;
    }
    case '2nd inning': {
      inningNow = 2;
      break;
    }
    case '3rd inning': {
      inningNow = 3;
      break;
    }
    case '4th inning': {
      inningNow = 4;
      break;
    }
    case '5th inning': {
      inningNow = 5;
      break;
    }
    case '6th inning': {
      inningNow = 6;
      break;
    }
    case '7th inning': {
      inningNow = 7;
      break;
    }
    case '8th inning': {
      inningNow = 8;
      break;
    }
    case '9th inning': {
      inningNow = 9;
      break;
    }
    case '10th inning': {
      inningNow = 10;
      break;
    }
    case '11th inning': {
      inningNow = 11;
      break;
    }
    case '12th inning': {
      inningNow = 12;
      break;
    }
    case '13th inning': {
      inningNow = 13;
      break;
    }
    case '14th inning': {
      inningNow = 14;
      break;
    }
    case '15th inning': {
      inningNow = 15;
      break;
    }
    case '16th inning': {
      inningNow = 16;
      break;
    }
    case '17th inning': {
      inningNow = 17;
      break;
    }
    case '18th inning': {
      inningNow = 18;
      break;
    }
    case '19th inning': {
      inningNow = 19;
      break;
    }
    case '20th inning': {
      inningNow = 20;
      break;
    }
    case '21th inning': {
      inningNow = 21;
      break;
    }
    case '22th inning': {
      inningNow = 22;
      break;
    }
    case '23th inning': {
      inningNow = 23;
      break;
    }
  }
  return inningNow;
}
module.exports = { KBOpbpInplay, KBOpbpHistory };
