const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const axios = require('axios');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const sport = 'basketball';
const league = 'CBA';
const pbpOnHome = require('../model/home/pbpOnHomeModel');

async function CBApbpInplay(parameter, data) {
  const firestoreData = data;
  let eventNow = 0;
  let eventOrderNow = 0;
  let periodNow = '1';
  // 14 秒一次
  let perStep;
  let timesPerLoop;
  if (parameter.first === 1) {
    // 最一開始需要初始化所以較長時間
    perStep = 30000;
    timesPerLoop = 2; // 一分鐘1次
  } else {
    perStep = 9000;
    timesPerLoop = 7; // 一分鐘6次
  }
  const betsID = parameter.betsID;
  const statscoreID = parameter.statscoreID;

  const token = await queryForToken();
  const pbpURL = `https://api.statscore.com/v2/events/${statscoreID}?token=${token[0].token}`;
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    let realtimeData = await database
      .ref(`${sport}/${league}/${betsID}`)
      .once('value');
    realtimeData = realtimeData.val();
    if (parameter.first === 0) {
      if (realtimeData.Summary.info) {
        if (realtimeData.Summary.Now_event) {
          eventNow = realtimeData.Summary.Now_event;
        }
        if (realtimeData.Summary.Now_event_order) {
          eventOrderNow = realtimeData.Summary.Now_event_order;
        }
        if (realtimeData.Summary.Now_periods) {
          periodNow = realtimeData.Summary.Now_periods;
        }
      }
    }
    const parameterPBP = {
      betsID: betsID,
      pbpURL: pbpURL,
      realtimeData: realtimeData,
      first: parameter.first,
      eventNow: eventNow,
      eventOrderNow: eventOrderNow,
      periodNow: periodNow
    };

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : pbp_statscore_${league} success`);
      clearInterval(timerForStatus2);
    } else {
      await doPBP(parameterPBP, firestoreData);
    }
  }, perStep);
}

async function CBApbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    try {
      const betsID = parameter.betsID;
      const statscoreID = parameter.statscoreID;
      const token = await queryForToken();
      const pbpURL = `https://api.statscore.com/v2/events/${statscoreID}?token=${token[0].token}`;

      const data = await axiosForURL(pbpURL);
      // 若沒分數值，給 -99 分讓結算知道是異常
      const homeScores =
        data.api.data.competition.season.stage.group.event.participants[0]
          .results.length > 0
          ? data.api.data.competition.season.stage.group.event.participants[0]
            .results[2].value
          : -99;
      const awayScores =
        data.api.data.competition.season.stage.group.event.participants[1]
          .results.length > 0
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .results[2].value
          : -99;
      for (let count = 6; count < 15; count++) {
        if (
          data.api.data.competition.season.stage.group.event.participants[0]
            .results[count].value !== ''
        ) {
          database
            .ref(
										`${sport}/${league}/${betsID}/Summary/info/home/periods${count - 5}`
            ).set({
              points: data.api.data.competition.season.stage.group.event.participants[0].results[count].value
            });
        }
        if (
          data.api.data.competition.season.stage.group.event.participants[1]
            .results[count].value !== ''
        ) {
          database
            .ref(
										`${sport}/${league}/${betsID}/Summary/info/away/periods${count - 5}`
            ).set({
              points: data.api.data.competition.season.stage.group.event.participants[1].results[count].value
            });
        }
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
            `${err} at pbp${league} of Match on ${betsID} by DY`
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
            `${err} at pbp${league} of status on ${betsID} by DY`
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
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at pbp${league} of yuhsien on ${betsID} by DY`
          )
        );
      }
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at pbp${league} of PBPHistory on by DY`
        )
      );
    }
    return resolve('ok');
  });
}

async function doPBP(parameter, firestoreData) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const realtimeData = parameter.realtimeData;
    const eventNow = parameter.eventNow;
    const eventOrderNow = parameter.eventOrderNow;
    const periodNow = parameter.periodNow;
    let first = parameter.first;
    let pbpFlag = 1;
    const data = await axiosForURL(pbpURL);
    if (data.api.data.competition.season.stage.group.event.status_type) {
      if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'finished'
      ) {
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
      } else if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'live'
      ) {
        if (realtimeData.Summary.status !== 'inprogress') {
          try {
            database
              .ref(`${sport}/${league}/${betsID}/Summary/status`)
              .set('inprogress');
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
      } else if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'Postponed'
      ) {
        try {
          database
            .ref(`${sport}/${league}/${betsID}/Summary/status`)
            .set('postponed');
          Match.upsert({
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
          database
            .ref(`${sport}/${league}/${betsID}/Summary/status`)
            .set('cancelled');
          Match.upsert({
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
      } else if (
        data.api.data.competition.season.stage.group.event.status_type ===
        'scheduled'
      ) {
        if (
          data.api.data.competition.season.stage.group.event.status_name ===
          'Postponed'
        ) {
          try {
            database
              .ref(`${sport}/${league}/${betsID}/Summary/status`)
              .set('postponed');
            Match.upsert({
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
        }
      } else {
        try {
          database
            .ref(`${sport}/${league}/${betsID}/Summary/status`)
            .set('tobefixed');
          Match.upsert({
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
    }
    if (first === 1) {
      await initRealtime(betsID, data);
      first = 0;
    } else {
      if (pbpFlag === 1) {
        await writeRealtime(betsID, data, eventNow, eventOrderNow, periodNow, firestoreData);
      }
    }

    return resolve('ok');
  });
}

async function axiosForURL(URL) {
  return new Promise(async function(resolve, reject) {
    try {
      const { data } = await axios(URL);
      return resolve(data);
    } catch (err) {
      return reject(
        new AppErrors.AxiosError(
          `${err} at checkmatch_statscore_${league} by DY`
        )
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

async function initRealtime(betsID, data) {
  return new Promise(async function(resolve, reject) {
    try {
      database
        .ref(`${sport}/${league}/${betsID}/Summary/info/home/name`)
        .set(
          data.api.data.competition.season.stage.group.event.participants[0]
            .name
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .name
            : null
        );
      database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/name`)
        .set(
          data.api.data.competition.season.stage.group.event.participants[1]
            .name
            ? data.api.data.competition.season.stage.group.event.participants[1]
              .name
            : null
        );
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    // here 隊員名稱 須以betsapi 輔助
    if (
      data.api.data.competition.season.stage.group.event.participants[0].lineups
        .length > 0
    ) {
      const homeLineup = await data.api.data.competition.season.stage.group.event.participants[0].lineups.sort(
        function(a, b) {
          return a.id > b.id ? 1 : -1;
        }
      );
      const awayLineup = await data.api.data.competition.season.stage.group.event.participants[1].lineups.sort(
        function(a, b) {
          return a.id > b.id ? 1 : -1;
        }
      );
      for (
        let playercount = 0;
        playercount < homeLineup.length;
        playercount++
      ) {
        try {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${
                playercount + 1
              }`
            )
            .set({
              points: 0,
              rebounds: 0,
              assists: 0,
              minutes: 0,
              name: homeLineup[playercount].participant_name,
              jersey_number: homeLineup[playercount].shirt_nr,
              order: playercount + 1,
              id: homeLineup[playercount].id
              // start: 0
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP on ${betsID} by DY`
            )
          );
        }
      }
      for (
        let playercount = 0;
        playercount < awayLineup.length;
        playercount++
      ) {
        try {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${
                playercount + 1
              }`
            )
            .set({
              points: 0,
              rebounds: 0,
              assists: 0,
              minutes: 0,
              name: awayLineup[playercount].participant_name,
              jersey_number: awayLineup[playercount].shirt_nr,
              order: playercount + 1,
              id: awayLineup[playercount].id
              // start: 0
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP on ${betsID} by DY`
            )
          );
        }
      }
      database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup0`
        )
        .set({
          name: homeLineup[homeLineup.length].participant_name
        });
      database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup0`
        )
        .set({
          name: awayLineup[awayLineup.length].participant_name
        });
    }
    try {
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
        .set('12:00');
      database.ref(`${sport}/${league}/${betsID}/Summary/Now_periods`).set('1');
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    resolve('ok');
  });
}

async function writeRealtime(betsID, data, eventNow, eventOrderNow, periodNow, firestoreData) {
  return new Promise(async function(resolve, reject) {
    const homeID = data.api.data.competition.season.stage.group.event
      .participants[0].id
      ? data.api.data.competition.season.stage.group.event.participants[0].id
      : null;
    try {
      database.ref(`${sport}/${league}/${betsID}/Summary/info/home/Total`).set({
        points:
          data.api.data.competition.season.stage.group.event.participants[0]
            .results.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .results[2].value
            : null,
        two_point_attempts:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[3].value
            : null,
        two_point_scored:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[4].value
            : null,
        two_point_percent:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[5].value
            : null,
        three_point_attempts:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[6].value
            : null,
        three_point_scored:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[7].value
            : null,
        three_point_percent:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[8].value
            : null,
        ft_point_attempts:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[9].value
            : null,
        ft_point_scored:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[10].value
            : null,
        ft_point_percent:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[11].value
            : null,
        rebounds:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[12].value
            : null,
        fouls:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[13].value
            : null
      });
      database.ref(`${sport}/${league}/${betsID}/Summary/info/away/Total`).set({
        points:
          data.api.data.competition.season.stage.group.event.participants[1]
            .results.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[1]
              .results[2].value
            : null,
        two_point_attempts: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[3].value
          : null,
        two_point_scored: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[4].value
          : null,
        two_point_percent: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[5].value
          : null,
        three_point_attempts: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[6].value
          : null,
        three_point_scored: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[7].value
          : null,
        three_point_percent: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[8].value
          : null,
        ft_point_attempts: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[9].value
          : null,
        ft_point_scored: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[10].value
          : null,
        ft_point_percent: data.api.data.competition.season.stage.group.event
          .participants[1].stats.length
          ? data.api.data.competition.season.stage.group.event.participants[1]
            .stats[11].value
          : null,
        rebounds:
          data.api.data.competition.season.stage.group.event.participants[1]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[1]
              .stats[12].value
            : null,
        fouls:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[13].value
            : null
      });
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }

    // 文字直播
    const totalEvent =
      data.api.data.competition.season.stage.group.event.events_incidents
        .length;

    // 避免執行時間過久，斷開連結，一次最多只存10個事件
    const eventEnd = totalEvent > eventNow + 10 ? eventNow + 10 : totalEvent;
    for (let eventCount = eventNow; eventCount < eventEnd; eventCount++) {
      eventNow = eventNow + 1;
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[eventCount].incident_name === '1st quarter started' ||
        data.api.data.competition.season.stage.group.event.events_incidents[eventCount].event_status_name === 'Break after 1st quarter' ||
				data.api.data.competition.season.stage.group.event.events_incidents[eventCount].incident_name === 'Break after'
      ) {
        continue;
      }
      const period =
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].participant_id === null
          ? 'common'
          : data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? 'home'
            : 'away';
      if (
        periodNow !==
        changePeriod(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          periodNow
        )
      ) {
        eventOrderNow = 1;
        periodNow = changePeriod(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          periodNow
        );
      } else {
        eventOrderNow = eventOrderNow + 1;
        periodNow = changePeriod(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          periodNow
        );
      }

      try {
        if (period === 'common') {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/periods${periodNow}/events${eventOrderNow}`
            )
            .set({
              description:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name +
                ' ' +
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name,
              description_ch: translateCommon(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name
              ),
              Period: periodNow,
              attribution: period,
              id:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].id
            });
          database
            .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
            .set(
              changeTime(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].event_time,
                periodNow
              )
            );
        } else {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/periods${periodNow}/events${eventOrderNow}`
            )
            .set({
              description:
                teamTrans(
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_id
                ) +
                ' ' +
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name,
              description_ch: await translateNormal(
                await teamTrans(
                  data.api.data.competition.season.stage.group.event.events_incidents[
                    eventCount
                  ].participant_id.toString()
                ),
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name
                ,
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name
              ),
              Period: periodNow,
              attribution: period,
              id:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].id,
              Clock: changeTime(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].event_time,
                periodNow
              )
            });
          database
            .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
            .set(
              changeTime(
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].event_time,
                periodNow
              )
            );
        }

        database
          .ref(
            `${sport}/${league}/${betsID}/Summary/info/away/periods${periodNow}/points`
          )
          .set(
            data.api.data.competition.season.stage.group.event.participants[1]
              .results.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[1].results[5 + parseInt(periodNow)].value
              : null
          );
        database
          .ref(
            `${sport}/${league}/${betsID}/Summary/info/home/periods${periodNow}/points`
          )
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .results.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].results[5 + parseInt(periodNow)].value
              : null
          );
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP on ${betsID} by DY`
          )
        );
      }
      const sportInfo = {
        sport: sport,
        periodNow: periodNow,
        clockNow: changeTime(
          data.api.data.competition.season.stage.group.event
            .events_incidents[eventCount].event_time,
          periodNow
        )
      };
      if (firestoreData !== null) {
        if (firestoreData.length > 0) {
          for (let fi = 0; fi < firestoreData.length; fi++) {
            if (firestoreData[fi].bets_id === betsID) {
              pbpOnHome.pbpOnHome(
                betsID,
                sportInfo,
                data.api.data.competition.season.stage.group.event
                  .participants[0].results[2].value,
                data.api.data.competition.season.stage.group.event
                  .participants[1].results[2].value
              );
              break;
            }
          }
        }
      }
      try {
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_periods`)
          .set(periodNow);
        await writeBacktoReal(betsID, eventNow, eventOrderNow);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP on ${betsID} by DY`
          )
        );
      }
    }
  });
}

function changeTime(oriTime, periodNow) {
  // 從12分鐘倒數
  const nowTime =
    parseInt(oriTime.split(':')[0]) * 60 + parseInt(oriTime.split(':')[1]);
  if (periodNow === '1') {
    const resultTime = 720 - nowTime;
    return `${Math.floor(resultTime / 60)}:${resultTime % 60}`;
  } else {
    // 第二節以上
    const resultTime = 720 - (nowTime - 720 * (periodNow - 1));
    return resultTime % 60 === 0
      ? `${Math.floor(resultTime / 60)}:${resultTime % 60}0`
      : `${Math.floor(resultTime / 60)}:${resultTime % 60}`;
  }
}

async function writeBacktoReal(betsID, eventNow, eventOrderNow) {
  return new Promise(async function(resolve, reject) {
    try {
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(eventNow);
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event_order`)
        .set(eventOrderNow);
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    resolve('ok');
  });
}

function teamTrans(id) {
  switch (id) {
    case '1938': {
      return '浙江稠洲銀行';
    }
    case '1946': {
      return '浙江廣廈';
    }
    case '1942': {
      return '深圳領航者';
    }
    case '2485': {
      return '四川金強';
    }
    case '1939': {
      return '天津先行者';
    }
    case '1937': {
      return '新疆廣匯飛虎';
    }
    case '1943': {
      return '廣州龍獅';
    }
    case '1948': {
      return '吉林東北虎';
    }
    case '1949': {
      return '遼寧衡潤飛豹';
    }
    case '2703': {
      return '南京大聖';
    }
    case '1950': {
      return '青島雙星雄鷹';
    }
    case '1951': {
      return '山東西王';
    }
    case '1952': {
      return '上海大鯊魚';
    }
    case '2704': {
      return '北京紫禁勇士';
    }
    case '1941': {
      return '北京首鋼';
    }
    case '1944': {
      return '福建鱘潯興';
    }
    case '1945': {
      return '廣東宏遠';
    }
    case '1940': {
      return '八一火箭';
    }
    case '1953': {
      return '山西汾酒猛龍';
    }
    default: {
      return id;
    }
  }
}

function translateCommon(event) {
  switch (event) {
    case '1st quarter started': {
      return '第一節開始';
    }
    case '2nd quarter started': {
      return '第二節開始';
    }
    case '3rd quarter started': {
      return '第三節開始';
    }
    case '4th quarter started': {
      return '第四節開始';
    }
    case '5th quarter started': {
      return '第五節開始';
    }
    case '6th quarter started': {
      return '第六節開始';
    }
    case '7th quarter started': {
      return '第七節開始';
    }
    case '8th quarter started': {
      return '第八節開始';
    }
    case 'Break after 1st quarter': {
      return '第一節結束';
    }
    case 'Break after 2nd quarter': {
      return '第二節結束';
    }
    case 'Break after 3rd quarter': {
      return '第三節結束';
    }
    case 'Break after 4th quarter': {
      return '第四節結束';
    }
    case 'Break after 5th quarter': {
      return '第五節結束';
    }
    case 'Break after 6th quarter': {
      return '第六節結束';
    }
    case 'Break after 7th quarter': {
      return '第七節結束';
    }
    case 'Break after 8th quarter': {
      return '第八節結束';
    }
    case 'Finished regular time': {
      return '比賽結束';
    }
    case 'Waiting for overtime': {
      return '等待延長賽';
    }
    case 'Overtime 1 started': {
      return '延長賽第一節開始';
    }
    case 'Overtime 2 started': {
      return '延長賽第二節開始';
    }
    case 'Overtime 3 started': {
      return '延長賽第三節開始';
    }
    case 'Overtime 4 started': {
      return '延長賽第四節開始';
    }
    case 'Overtime 5 started': {
      return '延長賽第四節開始';
    }
    case 'Start delayed': {
      return '比賽延遲開始';
    }
    default: {
      return '通用';
    }
  }
}

async function translateNormal(teamName, playerName, event) {
  let out;
  let string_ch;

  switch (event) {
    case 'Free throw in': {
      string_ch = '罰球命中';
      break;
    }
    case '2-point shot made': {
      string_ch = '投出兩分球命中';
      break;
    }
    case '3-point shot made': {
      string_ch = '投出三分球命中';
      break;
    }
    case 'Missed free throw': {
      string_ch = '罰球未命中';
      break;
    }
    case 'Missed 2pts shot': {
      string_ch = '投出兩分球未命中';
      break;
    }
    case 'Missed 3pts shot': {
      string_ch = '投出三分球未命中';
      break;
    }
    case 'Foul': {
      string_ch = '犯規';
      break;
    }
    case 'Offensive rebound': {
      string_ch = '搶下進攻籃板';
      break;
    }
    case 'Defensive rebound': {
      string_ch = '搶下防守籃板';
      break;
    }
    case 'Free throw 1/1': {
      string_ch = '罰球 1/1';
      break;
    }
    case 'Free throw 1/2': {
      string_ch = '罰球 1/2';
      break;
    }
    case 'Free throw 2/2': {
      string_ch = '罰球 2/2';
      break;
    }
    case 'Free throw 1/3': {
      string_ch = '罰球 1/3';
      break;
    }
    case 'Free throw 2/3': {
      string_ch = '罰球 2/3';
      break;
    }
    case 'Free throw 3/3': {
      string_ch = '罰球 3/3';
      break;
    }
    case 'Offensive foul': {
      string_ch = '進攻犯規';
      break;
    }
    case 'Technical foul': {
      string_ch = '技術犯規';
      break;
    }
    case 'Unsportsmanlike foul': {
      string_ch = '惡意犯規';
      break;
    }
    case 'Turnover': {
      string_ch = '失誤';
      break;
    }
    case '24 shot clock violations': {
      string_ch = '24秒違例';
      break;
    }
    case 'Travelling': {
      string_ch = '走步';
      break;
    }
    case 'Timeout': {
      string_ch = '暫停';
      break;
    }
    case 'Jump ball': {
      string_ch = '進行跳球';
      break;
    }
    case 'Injury': {
      string_ch = '出現傷兵';
      break;
    }
    case '1st quarter started': {
      string_ch = '第一節開始';
      break;
    }
    case '2nd quarter started': {
      string_ch = '第二節開始';
      break;
    }
    case '3rd quarter started': {
      string_ch = '第三節開始';
      break;
    }
    case '4th quarter started': {
      string_ch = '第四節開始';
      break;
    }
    case 'Foul bonus': {
      string_ch = '加罰';
      break;
    }
    case 'Block': {
      string_ch = '阻攻';
      break;
    }
    case 'Not started': {
      string_ch = '比賽尚未開始';
      break;
    }
    case 'Waiting for overtime': {
      string_ch = '等待進行延長賽';
      break;
    }
    case 'Finished after overtime': {
      string_ch = '比賽結束';
      break;
    }
    case 'Finished awarded win': {
      string_ch = '比賽結束';
      break;
    }
    case 'Finished regular time': {
      string_ch = '比賽結束';
      break;
    }
    case 'Cancelled': {
      string_ch = '比賽取消';
      break;
    }
    case 'Postponed': {
      string_ch = '比賽延期';
      break;
    }
    case 'Interrupted': {
      string_ch = '比賽中斷';
      break;
    }
    case 'Start delayed': {
      string_ch = '比賽延遲開始';
      break;
    }
    case 'Abandoned': {
      string_ch = '比賽放棄';
      break;
    }
    case 'Steal': {
      string_ch = '抄截';
      break;
    }
    case 'Overtime 1 started': {
      string_ch = '延長賽第一節開始';
      break;
    }
    case 'Overtime 2 started': {
      string_ch = '延長賽第二節開始';
      break;
    }
    case 'Overtime 3 started': {
      string_ch = '延長賽第三節開始';
      break;
    }
    case 'Overtime 4 started': {
      string_ch = '延長賽第四節開始';
      break;
    }
    case 'Overtime 5 started': {
      string_ch = '延長賽第四節開始';
      break;
    }
    case 'Break after': {
      string_ch = '休息';
      break;
    }
    case 'Break after 1st quarter': {
      string_ch = '第一節休息結束';
      break;
    }
    case 'Break after 2nd quarter': {
      string_ch = '第二節休息結束';
      break;
    }
    case 'Break after 3rd quarter': {
      string_ch = '第三節休息結束';
      break;
    }
    case 'Break after 4th quarter': {
      string_ch = '第四節休息結束';
      break;
    }
    case 'Break after overtime 1': {
      string_ch = '延長第一節休息結束';
      break;
    }
    case 'Break after overtime 2': {
      string_ch = '延長第二節休息結束';
      break;
    }
    case 'Break after overtime 3': {
      string_ch = '延長第三節休息結束';
      break;
    }
    case 'Break after overtime 4': {
      string_ch = '延長第四節休息結束';
      break;
    }
    case 'Break after overtime 5': {
      string_ch = '延長第五節休息結束';
      break;
    }
    case 'Offensive 3-second violation': {
      string_ch = '進攻三秒違例';
      break;
    }
    case 'Defensive 3-second violation': {
      string_ch = '防守三秒違例';
      break;
    }
    default: {
      string_ch = event;
      break;
    }
  }
  if (
    event === '1st quarter started' ||
    event === '2nd quarter started' ||
    event === '3rd quarter started' ||
    event === '4th quarter started' ||
    event === 'Not started' ||
    event === 'Waiting for overtime' ||
    event === 'Finished after overtime' ||
    event === 'Finished awarded win' ||
    event === 'Finished regular time' ||
    event === 'Cancelled' ||
    event === 'Postponed' ||
    event === 'Interrupted' ||
    event === 'Start delayed' ||
    event === 'Abandoned' ||
    event === 'Overtime 1 started' ||
    event === 'Overtime 2 started' ||
    event === 'Overtime 3 started' ||
    event === 'Overtime 4 started' ||
    event === 'Overtime 5 started' ||
    event === 'Break after' ||
    event === 'Break after 1st quarter' ||
    event === 'Break after 2nd quarter' ||
    event === 'Break after 3rd quarter' ||
    event === 'Break after 4th quarter' ||
    event === 'Break after overtime 1' ||
    event === 'Break after overtime 2' ||
    event === 'Break after overtime 3' ||
    event === 'Break after overtime 4' ||
    event === 'Break after overtime 5'
  ) {
    out = string_ch;
  } else {
    if (playerName !== '') {
      out = playerName + ' ' + string_ch;
    } else {
      out = teamName + ' ' + string_ch;
    }
  }

  return out;
}

function changePeriod(period, now_periods) {
  let periodNow = '0';
  switch (period) {
    case '1st quarter': {
      periodNow = '1';
      break;
    }
    case 'Not started': {
      periodNow = '1';
      break;
    }
    case '2nd quarter': {
      periodNow = '2';
      break;
    }
    case 'Break after 1st quarter': {
      periodNow = '2';
      break;
    }
    case '3rd quarter': {
      periodNow = '3';
      break;
    }
    case 'Break after 2nd quarter': {
      periodNow = '3';
      break;
    }
    case '4th quarter': {
      periodNow = '4';
      break;
    }
    case 'Break after 3rd quarter': {
      periodNow = '4';
      break;
    }
    case '5th quarter': {
      periodNow = '5';
      break;
    }
    case 'Break after 4th quarter': {
      periodNow = '5';
      break;
    }
    default: {
      periodNow = now_periods;
      break;
    }
  }
  return periodNow;
}

module.exports = { CBApbpInplay, CBApbpHistory };
