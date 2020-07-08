const modules = require('../util/modules');
const AppErrors = require('../util/AppErrors');
const db = require('../util/dbUtil');
const transNBA = require('./translateNBA.js');
const translateNBA = transNBA.translateNBA;
const firestoreName = 'pagetest_NBA';
// const nba_api_key = 'y7uxzm4stjju6dmkspnabaav';
const nba_api_key = 'bj7tvgz7qpsqjqaxmzsaqdnp';
// const nba_api_key = '6mmty4jtxz3guuy62a4yr5u5';

// 12 秒一次
const perStep = 12000;
// 一分鐘4次
const timesPerLoop = 4;
const Match = db.Match;
async function NBApbpInplay(parameter) {
  const gameID = parameter.gameID;
  const betsID = parameter.betsID;
  const periodsNow = parameter.periodsNow;
  const eventsNow = parameter.eventsNow;
  const realtimeData = parameter.realtimeData;
  if (periodsNow === 0 && eventsNow === 0) {
    await initRealtime(gameID, betsID);
  }

  let countForStatus2 = 0;
  const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
  const summaryURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/summary.json?api_key=${nba_api_key}`;
  const homeData = realtimeData.home;
  const awayData = realtimeData.away;
  const keywordHome = [];
  const keywordAway = [];
  const transSimpleHome = [];
  const transSimpleAway = [];

  for (let i = 0; i < Object.keys(homeData.lineup).length; i++) {
    keywordHome.push(homeData.lineup[`lineup${i}`].name);
    transSimpleHome.push(homeData.lineup[`lineup${i}`].transSimpleHome);
  }
  for (let i = 0; i < Object.keys(awayData.lineup).length; i++) {
    keywordAway.push(awayData.lineup[`lineup${i}`].name);
    transSimpleAway.push(awayData.lineup[`lineup${i}`].transSimpleAway);
  }
  const timerForStatus2 = setInterval(async function() {
    const parameterPBP = {
      periodsNow: periodsNow,
      eventsNow: eventsNow,
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

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log('pbpNBA is success');
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function summmaryZH(gameID) {
  return new Promise(async function(resolve, reject) {
    const zhSummaryURL = `http://api.sportradar.us/nba/trial/v7/zh/games/${gameID}/summary.json?api_key=${nba_api_key}`;
    try {
      const keywordTransHome = [];
      const keywordTransAway = [];
      const { data } = await modules.axios(zhSummaryURL);
      for (let i = 0; i < data.home.players.length; i++) {
        keywordTransHome.push(data.home.players[i].full_name);
      }
      for (let i = 0; i < data.away.players.length; i++) {
        keywordTransAway.push(data.away.players[i].full_name);
      }

      return resolve([keywordTransHome, keywordTransAway]);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpNBA of summaryZH by DY`)
      );
    }
  });
}
async function summmaryEN(gameID) {
  return new Promise(async function(resolve, reject) {
    const enSummaryURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/summary.json?api_key=${nba_api_key}`;
    try {
      const keywordHome = [];
      const keywordAway = [];
      const numberHome = [];
      const numberAway = [];
      const { data } = await modules.axios(enSummaryURL);
      const homeTeamName = data.home.name;
      const awayTeamName = data.away.name;
      for (let i = 0; i < data.home.players.length; i++) {
        keywordHome.push(data.home.players[i].full_name);
        numberHome.push(data.home.players[i].jersey_number);
      }
      for (let i = 0; i < data.away.players.length; i++) {
        keywordAway.push(data.away.players[i].full_name);
        numberAway.push(data.away.players[i].jersey_number);
      }
      return resolve([
        homeTeamName,
        keywordHome,
        numberHome,
        awayTeamName,
        keywordAway,
        numberAway
      ]);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpNBA of summaryEN by DY`)
      );
    }
  });
}
async function NBApbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    const gameID = parameter.gameID;
    const betsID = parameter.betsID;

    const pbpURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/pbp.json?api_key=${nba_api_key}`;
    const enSummaryURL = `http://api.sportradar.us/nba/trial/v7/en/games/${gameID}/summary.json?api_key=${nba_api_key}`;
    try {
      let { data } = await modules.axios(pbpURL);
      const dataPBP = data;

      for (
        let periodsCount = 0;
        periodsCount < dataPBP.periods.length;
        periodsCount++
      ) {
        for (
          let eventsCount = 0;
          eventsCount < dataPBP.periods[periodsCount].events.length;
          eventsCount++
        ) {
          try {
            await modules.firestore
              .collection(`${firestoreName}_PBP`)
              .doc(betsID)
              .set(
                {
                  pbp: {
                    [`periods${periodsCount + 1}`]: {
                      [`events${eventsCount}`]: dataPBP.periods[periodsCount]
                        .events[eventsCount]
                    }
                  }
                },
                { merge: true }
              );
          } catch (err) {
            return reject(
              new AppErrors.FirebaseCollectError(
                `${err} at pbpNBA of NBApbpHistory by DY`
              )
            );
          }
        }
      }

      ({ data } = await modules.axios(enSummaryURL));
      const dataSummary = data;
      for (let i = 0; i < dataSummary.home.players.length; i++) {
        try {
          await modules.firestore
            .collection(`${firestoreName}_PBP`)
            .doc(betsID)
            .set(
              {
                players: {
                  home: dataSummary.home.players[i],
                  away: dataSummary.away.players[i]
                }
              },
              { merge: true }
            );
        } catch (err) {
          return reject(
            new AppErrors.FirebaseCollectError(
              `${err} at pbpNBA of NBApbpHistory by DY`
            )
          );
        }
      }
      try {
        await modules.firestore
          .collection(firestoreName)
          .doc(betsID)
          .set({ flag: { status: 0 } }, { merge: true });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseCollectError(
            `${err} at pbpNBA of NBApbpHistory about status by DY`
          )
        );
      }
      try {
        await modules.database
          .ref(`basketball/NBA/${betsID}/Summary/statuts`)
          .set('closed');
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpNBA of NBApbpHistory about status by DY`
          )
        );
      }
      try {
        await Match.upsert({
          bets_id: betsID,
          home_points: dataSummary.home.statistics.points,
          away_points: dataSummary.away.statistics.points,
          status: 0
        });
      } catch (err) {
        return reject(
          new AppErrors.MysqlError(
            `${err} at pbpNBA of NBApbpHistory about status by DY`
          )
        );
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpNBA of NBApbpHistory by DY`)
      );
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
      // write to json
      // [主隊球員中文名字, 客隊球員中文名字]
      [keywordTransHome, keywordTransAway] = await summmaryZH(gameID);
      // [主隊英文名稱、主隊隊員英文名字、主隊隊員背號、客隊英文名稱、客隊隊員英文名字、客隊隊員背號]
      for (let i = 0; i < keywordTransHome.length; i++) {
        try {
          keywordTransHome[i] = await modules.simple2Tradition.translate(
            keywordTransHome[i]
          );
        } catch (err) {
          return reject(
            new AppErrors.PBPNBAError(
              `${err} at pbpNBA of initRealtime about simple2Tradition by DY`
            )
          );
        }
      }
      for (let i = 0; i < keywordTransHome.length; i++) {
        try {
          keywordTransAway[i] = await modules.simple2Tradition.translate(
            keywordTransAway[i]
          );
        } catch (err) {
          return reject(
            new AppErrors.PBPNBAError(
              `${err} at pbpNBA of initRealtime about simple2Tradition by DY`
            )
          );
        }
      }
      try {
        [
          homeTeamName,
          keywordHome,
          numberHome,
          awayTeamName,
          keywordAway,
          numberAway
        ] = await summmaryEN(gameID);
      } catch (err) {
        return reject(
          new AppErrors.PBPNBAError(
            `${err} at pbpNBA of initRealtime about summaryEN by DY`
          )
        );
      }
      const transSimpleHome = [];
      const transSimpleAway = [];

      try {
        await modules.database
          .ref(`basketball/NBA/${betsID}/Summary/info/home/name`)
          .set(homeTeamName);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpNBA of initRealtime about home/name by DY`
          )
        );
      }
      try {
        await modules.database
          .ref(`basketball/NBA/${betsID}/Summary/info/away/name`)
          .set(awayTeamName);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpNBA of initRealtime about away/name by DY`
          )
        );
      }
      for (let i = 0; i < keywordHome.length; i++) {
        transSimpleHome[i] = `${keywordHome[i]}(#${numberHome[i]})`;
        try {
          await modules.database
            .ref(`basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}`)
            .set({
              name: keywordHome[i],
              name_ch: keywordTransHome[i],
              jersey_number: numberHome[i],
              transSimpleHome: transSimpleHome[i]
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at pbpNBA of initRealtime about home/lineup by DY`
            )
          );
        }
      }
      for (let i = 0; i < keywordAway.length; i++) {
        transSimpleAway[i] = `${keywordAway[i]}(#${numberAway[i]})`;
        try {
          await modules.database
            .ref(`basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}`)
            .set({
              name: keywordAway[i],
              name_ch: keywordTransAway[i],
              jersey_number: numberAway[i],
              transSimpleAway: transSimpleAway[i]
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at pbpNBA of initRealtime about away/lineup by DY`
            )
          );
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.PBPNBAError(`${err} at pbpNBA of initRealtime by DY`)
      );
    }
    return resolve('ok');
  });
}
async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    let periodsNow = parameter.periodsNow;
    let eventsNow = parameter.eventsNow;
    const pbpURL = parameter.pbpURL;
    const homeData = parameter.homeData;
    const awayData = parameter.awayData;
    const keywordHome = parameter.keywordHome;
    const transSimpleHome = parameter.transSimpleHome;
    const keywordAway = parameter.keywordAway;
    const transSimpleAway = parameter.transSimpleAway;
    const realtimeData = parameter.realtimeData;
    try {
      const { data } = await modules.axios(pbpURL);
      const dataPBP = data;
      if (dataPBP.status !== 'inprogress') {
        try {
          await modules.database
            .ref(`basketball/NBA/${betsID}/Summary/status`)
            .set('closed');
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at pbpNBA of doPBP about status by DY`
            )
          );
        }
      } else if (dataPBP.status === 'inprogress') {
        if (realtimeData.Summary.status !== 'inprogress') {
          try {
            await modules.firestore
              .collection(firestoreName)
              .doc(betsID)
              .set({ flag: { status: 1 } }, { merge: true });
          } catch (err) {
            return reject(
              new AppErrors.FirebaseCollectError(
                `${err} at pbpNBA of doPBP about status by DY`
              )
            );
          }
          try {
            await modules.database
              .ref(`basketball/NBA/${betsID}/Summary/status`)
              .set('inprogress');
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about status by DY`
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
                `${err} at pbpNBA of doPBP about status by DY`
              )
            );
          }
        }
      } else {
      }
      for (
        let periodsCount = periodsNow;
        periodsCount < dataPBP.periods.length;
        periodsCount++
      ) {
        if (periodsCount !== periodsNow) {
          periodsNow = periodsNow + 1;
          eventsNow = 0;
        }
        for (
          let eventsCount = eventsNow;
          eventsCount < dataPBP.periods[periodsCount].events.length;
          eventsCount++
        ) {
          if (eventsCount !== eventsNow) {
            eventsNow = eventsNow + 1;
          }
          const descCH = await translateNBA(
            dataPBP.periods[periodsCount].events[eventsCount].description,
            keywordHome,
            keywordAway,
            transSimpleHome,
            transSimpleAway
          );
          try {
            await modules.database
              .ref(
                `basketball/NBA/${betsID}/Summary/periods${
                  periodsCount + 1
                }/events${eventsCount}/description`
              )
              .set(
                dataPBP.periods[periodsCount].events[eventsCount].description
              );
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about description by DY`
              )
            );
          }
          try {
            await modules.database
              .ref(
                `basketball/NBA/${betsID}/Summary/periods${
                  periodsCount + 1
                }/events${eventsCount}/description_ch`
              )
              .set(descCH);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about description_ch by DY`
              )
            );
          }
          try {
            await modules.database
              .ref(
                `basketball/NBA/${betsID}/Summary/periods${
                  periodsCount + 1
                }/events${eventsCount}/clock`
              )
              .set(dataPBP.periods[periodsCount].events[eventsCount].clock);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about clock by DY`
              )
            );
          }
          if (
            dataPBP.periods[periodsCount].events[eventsCount].event_type !==
              'review' &&
            dataPBP.periods[periodsCount].events[eventsCount].event_type !==
              'stoppage' &&
            dataPBP.periods[periodsCount].events[eventsCount].event_type !==
              'endperiod'
          ) {
            if (
              dataPBP.periods[periodsCount].events[eventsCount].attribution
                .name === homeData.name
            ) {
              try {
                await modules.database
                  .ref(
                    `basketball/NBA/${betsID}/Summary/periods${
                      periodsCount + 1
                    }/events${eventsCount}/attribution`
                  )
                  .set('home');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at pbpNBA of doPBP about attribution by DY`
                  )
                );
              }
            }
            if (
              dataPBP.periods[periodsCount].events[eventsCount].attribution
                .name === awayData.name
            ) {
              try {
                await modules.database
                  .ref(
                    `basketball/NBA/${betsID}/Summary/periods${
                      periodsCount + 1
                    }/events${eventsCount}/attribution`
                  )
                  .set('away');
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at pbpNBA of doPBP about attribution by DY`
                  )
                );
              }
            }
          } else if (
            dataPBP.periods[periodsCount].events[eventsCount].event_type ===
            'stoppage'
          ) {
            try {
              await modules.database
                .ref(
                  `basketball/NBA/${betsID}/Summary/periods${
                    periodsCount + 1
                  }/events${eventsCount}/attribution`
                )
                .set('home');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpNBA of doPBP about attribution by DY`
                )
              );
            }
          } else {
            try {
              await modules.database
                .ref(
                  `basketball/NBA/${betsID}/Summary/periods${
                    periodsCount + 1
                  }/events${eventsCount}/attribution`
                )
                .set('common');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpNBA of doPBP about attribution by DY`
                )
              );
            }
          }
          try {
            await modules.database
              .ref(`basketball/NBA/${betsID}/Summary/Now_clock`)
              .set(dataPBP.periods[periodsCount].events[eventsCount].clock);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about now_clock by DY`
              )
            );
          }
          try {
            await modules.database
              .ref(`basketball/NBA/${betsID}/Summary/Now_periods`)
              .set(periodsCount + 1);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about now_periods by DY`
              )
            );
          }
          try {
            await modules.database
              .ref(
                `basketball/NBA/${betsID}/Summary/info/home/periods${
                  periodsCount + 1
                }/points`
              )
              .set(dataPBP.periods[periodsCount].scoring.home.points);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about homepoints by DY`
              )
            );
          }
          try {
            await modules.database
              .ref(
                `basketball/NBA/${betsID}/Summary/info/away/periods${
                  periodsCount + 1
                }/points`
              )
              .set(dataPBP.periods[periodsCount].scoring.away.points);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at pbpNBA of doPBP about awaypoints by DY`
              )
            );
          }
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpNBA of doPBP by DY`)
      );
    }
    return resolve('ok');
  });
}
async function doSummary(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const summaryURL = parameter.summaryURL;
    try {
      const { data } = await modules.axios(summaryURL);
      const dataSummary = data;
      const realtimeData = parameter.realtimeData;
      try {
        await modules.database
          .ref(`basketball/NBA/${betsID}/Summary/info/home/Total`)
          .set({
            assists: dataSummary.home.statistics.assists,
            blocks: dataSummary.home.statistics.blocks,
            free_throws_att: dataSummary.home.statistics.free_throws_att,
            free_throws_made: dataSummary.home.statistics.free_throws_made,
            personal_fouls: dataSummary.home.statistics.personal_fouls,
            points_in_paint: dataSummary.home.statistics.points_in_paint,
            rebounds: dataSummary.home.statistics.rebounds,
            points: dataSummary.home.statistics.points,
            steals: dataSummary.home.statistics.steals,
            three_points_att: dataSummary.home.statistics.three_points_att,
            three_points_made: dataSummary.home.statistics.three_points_made,
            turnovers: dataSummary.home.statistics.turnovers,
            two_points_att: dataSummary.home.statistics.two_points_att,
            two_points_made: dataSummary.home.statistics.two_points_made
          });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpNBA of doSummary about home/total by DY`
          )
        );
      }
      try {
        await modules.database
          .ref(`basketball/NBA/${betsID}/Summary/info/away/Total`)
          .set({
            assists: dataSummary.away.statistics.assists,
            blocks: dataSummary.away.statistics.blocks,
            free_throws_att: dataSummary.away.statistics.free_throws_att,
            free_throws_made: dataSummary.away.statistics.free_throws_made,
            personal_fouls: dataSummary.away.statistics.personal_fouls,
            points_in_paint: dataSummary.away.statistics.points_in_paint,
            rebounds: dataSummary.away.statistics.rebounds,
            points: dataSummary.away.statistics.points,
            steals: dataSummary.away.statistics.steals,
            three_points_att: dataSummary.away.statistics.three_points_att,
            three_points_made: dataSummary.away.statistics.three_points_made,
            turnovers: dataSummary.away.statistics.turnovers,
            two_points_att: dataSummary.away.statistics.two_points_att,
            two_points_made: dataSummary.away.statistics.two_points_made
          });
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbpNBA of doSummary about away/total by DY`
          )
        );
      }
      for (let i = 0; i < dataSummary.home.players.length; i++) {
        if (dataSummary.home.players[i].starter !== undefined) {
          if (
            realtimeData.Summary.info.home.lineup[`lineup${i}`].starter ===
            undefined
          ) {
            try {
              await modules.database
                .ref(
                  `basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}/starter`
                )
                .set(dataSummary.home.players[i].primary_position);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpNBA of doSummary about home/lineup/starter by DY`
                )
              );
            }
          }
        } else {
          if (
            realtimeData.Summary.info.home.lineup[`lineup${i}`].starter ===
            undefined
          ) {
            try {
              await modules.database
                .ref(
                  `basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}/starter`
                )
                .set('0');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpNBA of doSummary about away/lineup/starter by DY`
                )
              );
            }
          }
        }
        try {
          await modules.database
            .ref(
              `basketball/NBA/${betsID}/Summary/info/home/lineup/lineup${i}/statistics`
            )
            .set({
              minutes: dataSummary.home.players[i].statistics.minutes,
              points: dataSummary.home.players[i].statistics.points,
              rebounds: dataSummary.home.players[i].statistics.rebounds,
              assists: dataSummary.home.players[i].statistics.assists
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at pbpNBA of doSummary about home/lineup/statistics by DY`
            )
          );
        }
      }
      for (let i = 0; i < dataSummary.away.players.length; i++) {
        if (dataSummary.away.players[i].starter !== undefined) {
          if (
            realtimeData.Summary.info.away.lineup[`lineup${i}`].starter ===
            undefined
          ) {
            try {
              await modules.database
                .ref(
                  `basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}/starter`
                )
                .set(dataSummary.away.players[i].primary_position);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpNBA of doSummary about away/lineup/starter by DY`
                )
              );
            }
          }
        } else {
          if (
            realtimeData.Summary.info.away.lineup[`lineup${i}`].starter ===
            undefined
          ) {
            try {
              await modules.database
                .ref(
                  `basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}/starter`
                )
                .set('0');
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at pbpNBA of doSummary about away/lineup/starter by DY`
                )
              );
            }
          }
        }
        try {
          await modules.database
            .ref(
              `basketball/NBA/${betsID}/Summary/info/away/lineup/lineup${i}/statistics`
            )
            .set({
              minutes: dataSummary.away.players[i].statistics.minutes,
              points: dataSummary.away.players[i].statistics.points,
              rebounds: dataSummary.away.players[i].statistics.rebounds,
              assists: dataSummary.away.players[i].statistics.assists
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at pbpNBA of doSummary about away/lineup/statistics by DY`
            )
          );
        }
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(`${err} at pbpNBA of doSummary by DY`)
      );
    }
    return resolve('ok');
  });
}
module.exports = { NBApbpInplay, NBApbpHistory };
