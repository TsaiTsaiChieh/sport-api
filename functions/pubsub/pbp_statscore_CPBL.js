const axios = require('axios');
const firebaseAdmin = require('../util/firebaseUtil');
const database = firebaseAdmin().database();
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const sport = 'baseball';
const league = 'CPBL';
const pbpOnHome = require('../model/home/pbpOnHomeModel');

async function CPBLpbpInplay(parameter, data) {
  const firestoreData = data;
  let eventNow = 0;
  let eventOrderNow = 0;
  let inningNow = 1;
  let halfNow = '0';
  let hitterNameNow = '';
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
        if (realtimeData.Summary.Now_innings) {
          inningNow = realtimeData.Summary.Now_innings;
        }
        if (realtimeData.Summary.Now_halfs) {
          halfNow = realtimeData.Summary.Now_halfs;
        }
        if (realtimeData.Summary.Now_hitter_name) {
          hitterNameNow = realtimeData.Summary.Now_hitter_name;
        }
      }
    }

    const baseballParameter = {
      eventNow: eventNow,
      eventOrderNow: eventOrderNow,
      inningNow: inningNow,
      halfNow: halfNow,
      hitterNameNow: hitterNameNow

    };
    const parameterPBP = {
      betsID: betsID,
      pbpURL: pbpURL,
      realtimeData: realtimeData,
      first: parameter.first,
      baseballParameter: baseballParameter
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

async function CPBLpbpHistory(parameter) {
  return new Promise(async function(resolve, reject) {
    try {
      const betsID = parameter.betsID;
      const statscoreID = parameter.statscoreID;
      const token = await queryForToken();
      const pbpURL = `https://api.statscore.com/v2/events/${statscoreID}?token=${token[0].token}`;

      const data = await axiosForURL(pbpURL);

      const homeScores =
			data.api.data.competition.season.stage.group.event.participants[0].results.length > 0 ? data.api.data.competition.season.stage.group.event.participants[0].results[2].value : -99;
      const awayScores =
			data.api.data.competition.season.stage.group.event.participants[1].results.length > 0 ? data.api.data.competition.season.stage.group.event.participants[1].results[2].value : -99;
      database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/Total/points`)
        .set(awayScores);
      database
        .ref(`${sport}/${league}/${betsID}/Summary/info/home/Total/points`)
        .set(homeScores);
      for (let count = 3; count < 26; count++) {
        if (
          data.api.data.competition.season.stage.group.event.participants[0]
            .results[count].value !== ''
        ) {
          database
            .ref(
										`${sport}/${league}/${betsID}/Summary/info/home/Innings${
											count - 2
										}`
            )
            .set({
              scoring: {
                runs:
										data.api.data.competition.season.stage.group.event.participants[0].results[count].value
              }
            });
        }
        if (
          data.api.data.competition.season.stage.group.event.participants[1]
            .results[count].value !== ''
        ) {
          database
            .ref(
										`${sport}/${league}/${betsID}/Summary/info/away/Innings${
											count - 2
										}`
            )
            .set({
              scoring: {
                runs:
									data.api.data.competition.season.stage.group.event.participants[1].results[count].value
              }
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
    const baseballParameter = parameter.baseballParameter;
    let first = parameter.first;
    let pbpFlag = 1;
    const data = await axiosForURL(pbpURL);
    // check status of match
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
      data.api.data.competition.season.stage.group.event.status_type === 'live'
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
    if (first === 1) {
      await initRealtime(betsID, data);
      first = 0;
    } else {
      if (pbpFlag === 1) {
        await writeRealtime(betsID, data, baseballParameter, firestoreData);
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
              .name : null
        );
      database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/name`)
        .set(
          data.api.data.competition.season.stage.group.event.participants[1]
            .name
            ? data.api.data.competition.season.stage.group.event.participants[1]
              .name : null
        );
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    try {
      database.ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`).set('0');
      database.ref(`${sport}/${league}/${betsID}/Summary/Now_innings`).set(1);
      database.ref(`${sport}/${league}/${betsID}/Summary/Now_event`).set(0);
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event_order`)
        .set(0);
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

async function writeRealtime(betsID, data, baseballParameter, firestoreData) {
  return new Promise(async function(resolve, reject) {
    let eventNow = parseInt(baseballParameter.eventNow);
    let eventOrderNow = baseballParameter.eventOrderNow;
    let inningNow = baseballParameter.inningNow;
    let halfNow = baseballParameter.halfNow;
    let hitterNameNow = baseballParameter.hitterNameNow;
    const homeID =
      data.api.data.competition.season.stage.group.event.participants[0].id;
    try {
      database.ref(`${sport}/${league}/${betsID}/Summary/info/home/Total`).set({
        points:
          data.api.data.competition.season.stage.group.event.participants[0]
            .results[2].value,
        hits:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[0].value
            : null,
        errors:
          data.api.data.competition.season.stage.group.event.participants[0]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[0]
              .stats[1].value
            : null
      });

      database.ref(`${sport}/${league}/${betsID}/Summary/info/away/Total`).set({
        points:
          data.api.data.competition.season.stage.group.event.participants[1]
            .results[2].value,
        hits:
          data.api.data.competition.season.stage.group.event.participants[1]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[1]
              .stats[0].value
            : null,
        errors:
          data.api.data.competition.season.stage.group.event.participants[1]
            .stats.length > 0
            ? data.api.data.competition.season.stage.group.event.participants[1]
              .stats[1].value
            : null
      });
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    for (let count = 3; count < 26; count++) {
      try {
        if (
          data.api.data.competition.season.stage.group.event.participants[0]
            .results[count].value !== ''
        ) {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/home/Innings${
                count - 2
              }`
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
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/away/Innings${
                count - 2
              }`
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
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP on ${betsID} by DY`
          )
        );
      }
    }

    // 文字直播
    const totalEvent =
      data.api.data.competition.season.stage.group.event.events_incidents
        .length;

    const eventEnd = totalEvent > eventNow + 10 ? eventNow + 10 : totalEvent;
    for (let eventCount = eventNow; eventCount < eventEnd; eventCount++) {
      const tempHalf = halfNow;
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 2523 ||
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 2524 ||
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 562
      ) {
        eventNow = parseInt(eventNow) + 1;
        continue;
      }
      if (data.api.data.competition.season.stage.group.event.events_incidents[
        eventCount
      ].incident_id === 563) {
        hitterNameNow = data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].participant_name;
      }
      eventNow = parseInt(eventNow) + 1;
      const half =
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].participant_id === null
          ? 'common'
          : data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].incident_id !== 563
            ? tempHalf
            : data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
              ? '1'
              : '0';
      if (
        inningNow !==
        changeInning(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          inningNow
        )
      ) {
        eventOrderNow = 1;
        inningNow = changeInning(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          inningNow
        );
        // 換局
        halfNow = '0';
      } else if (halfNow !== half && half !== 'common') {
        // 換節
        eventOrderNow = 1;
        halfNow = half;
      } else {
        eventOrderNow = eventOrderNow + 1;
        inningNow = changeInning(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          inningNow
        );
      }
      try {
        if (half === 'common') {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/Innings${inningNow}/halfs${halfNow}/event${eventOrderNow}`
            )
            .set({
              // 待翻譯
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
              Inning: inningNow,
              Half: halfNow,
              id:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].id
            });
        } else {
          database
            .ref(
              `${sport}/${league}/${betsID}/Summary/Innings${inningNow}/halfs${half}/event${eventOrderNow}`
            )
            .set({
              description:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name +
                ' ' +
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name,
              description_ch: translateNormal(
                half,
                data,
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name,
                hitterNameNow,
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name
              ),
              Inning: inningNow,
              Half: half,
              id:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].id
            });
        }
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP on ${betsID} by DY`
          )
        );
      }
      try {
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_innings`)
          .set(inningNow);
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_strikes`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[17].value === ''
                ? null
                : data.api.data.competition.season.stage.group.event
                  .participants[0].stats[17].value
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats.length > 0
                ? data.api.data.competition.season.stage.group.event
                  .participants[1].stats[17].value === ''
                  ? null
                  : data.api.data.competition.season.stage.group.event
                    .participants[1].stats[17].value
                : null
          );
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_outs`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[18].value === ''
                ? null
                : data.api.data.competition.season.stage.group.event
                  .participants[0].stats[18].value
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats.length > 0
                ? data.api.data.competition.season.stage.group.event
                  .participants[1].stats[18].value === ''
                  ? null
                  : data.api.data.competition.season.stage.group.event
                    .participants[1].stats[18].value
                : null
          );
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_balls`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[19].value === ''
                ? null
                : data.api.data.competition.season.stage.group.event
                  .participants[0].stats[19].value
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats.length > 0
                ? data.api.data.competition.season.stage.group.event
                  .participants[1].stats[19].value === ''
                  ? null
                  : data.api.data.competition.season.stage.group.event
                    .participants[1].stats[19].value
                : null
          );
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_firstbase`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[20].value === ''
                ? null
                : parseInt(
                  data.api.data.competition.season.stage.group.event
                    .participants[0].stats[20].value
                )
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats.length > 0
                ? data.api.data.competition.season.stage.group.event
                  .participants[1].stats[20].value === ''
                  ? null
                  : parseInt(
                    data.api.data.competition.season.stage.group.event
                      .participants[1].stats[20].value
                  )
                : null
          );
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_secondbase`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[21].value === ''
                ? null
                : parseInt(
                  data.api.data.competition.season.stage.group.event
                    .participants[0].stats[21].value
                )
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats.length > 0
                ? data.api.data.competition.season.stage.group.event
                  .participants[1].stats[21].value === ''
                  ? null
                  : parseInt(
                    data.api.data.competition.season.stage.group.event
                      .participants[1].stats[21].value
                  )
                : null
          );
        database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_thirdbase`)
          .set(
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats.length > 0
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[22].value === ''
                ? null
                : parseInt(
                  data.api.data.competition.season.stage.group.event
                    .participants[0].stats[22].value
                )
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats.length > 0
                ? data.api.data.competition.season.stage.group.event
                  .participants[1].stats[22].value === ''
                  ? null
                  : parseInt(
                    data.api.data.competition.season.stage.group.event
                      .participants[1].stats[22].value
                  )
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
        inningNow: inningNow,
        halfNow: halfNow
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
    }
    await writeBacktoReal(betsID, eventNow, eventOrderNow, halfNow);
    resolve('ok');
  });
}

async function writeBacktoReal(betsID, eventNow, eventOrderNow, halfNow) {
  return new Promise(async function(resolve, reject) {
    try {
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(parseInt(eventNow));
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event_order`)
        .set(parseInt(eventOrderNow));
      database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
        .set(halfNow);
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

function translateCommon(event) {
  switch (event) {
    case 'Start delayed': {
      return '比賽延遲開始';
    }
    case '1st inning started': {
      return '第一局開始';
    }
    case '2nd inning started': {
      return '第二局開始';
    }
    case '3rd inning started': {
      return '第三局開始';
    }
    case '4th inning started': {
      return '第四局開始';
    }
    case '5th inning started': {
      return '第五局開始';
    }
    case '6th inning started': {
      return '第六局開始';
    }
    case '7th inning started': {
      return '第七局開始';
    }
    case '8th inning started': {
      return '第八局開始';
    }
    case '9th inning started': {
      return '第九局開始';
    }
    case '10th inning started': {
      return '第十局開始';
    }
    case '11th inning started': {
      return '第十一局開始';
    }
    case '12th inning started': {
      return '第十二局開始';
    }
    case '13th inning started': {
      return '第十三局開始';
    }
    case '14th inning started': {
      return '第十四局開始';
    }
    case '15th inning started': {
      return '第十五局開始';
    }
    case '16th inning started': {
      return '第十六局開始';
    }
    case '17th inning started': {
      return '第十七局開始';
    }
    case '18th inning started': {
      return '第十八局開始';
    }
    case '19th inning started': {
      return '第十九局開始';
    }
    case '20th inning started': {
      return '第二十局開始';
    }
    case '21th inning started': {
      return '第二十一局開始';
    }
    case '22th inning started': {
      return '第二十二局開始';
    }
    case '23th inning started': {
      return '第二十三局開始';
    }
    case 'Finished regular time': {
      return '比賽結束';
    }
    default: {
      return '通用';
    }
  }
}

function translateNormal(half, data, name, hitterName, event) {
  let out;
  let string_ch;

  switch (event) {
    case 'Start delayed': {
      string_ch = '比賽延遲開始';
      break;
    }
    case 'Not started': {
      string_ch = '比賽尚未開始';
      break;
    }
    case 'Finished regular time': {
      string_ch = '比賽結束';
      break;
    }
    case 'Hit by pitch': {
      string_ch = '遭觸身';
      break;
    }
    case 'Batter in the box': {
      string_ch = '站上打擊位置';
      break;
    }
    case 'Ball': {
      string_ch = '投出壞球';
      break;
    }
    case 'Strike': {
      string_ch = '投出好球';
      break;
    }
    case 'Swing and miss': {
      string_ch = '揮棒落空';
      break;
    }
    case 'Strikeout': {
      string_ch = '被三振';
      break;
    }
    case 'Out': {
      string_ch = '出局';
      break;
    }
    case 'Error': {
      string_ch = '失誤';
      break;
    }
    case 'Foul': {
      string_ch = '失誤';
      break;
    }
    case 'Walk': {
      string_ch = '被保送';
      break;
    }
    case 'Stolen base': {
      string_ch = '跑者盜壘';
      break;
    }
    case 'Pickoff attempt': {
      string_ch = '牽制';
      break;
    }
    case 'Single': {
      string_ch = '擊出一壘安打';
      break;
    }
    case 'Double': {
      string_ch = '擊出二壘安打';
      break;
    }
    case 'Triple': {
      string_ch = '擊出三壘安打';
      break;
    }
    case 'Home run': {
      string_ch = '擊出全壘打';
      break;
    }
    case 'Pitcher change': {
      string_ch = '投手交換';
      break;
    }
    case 'Double play': {
      string_ch = '雙殺';
      break;
    }
    case 'Triple play': {
      string_ch = '三殺';
      break;
    }
    case 'Wild pitch': {
      string_ch = '野手選擇';
      break;
    }
    case 'Sacrifice hit': {
      string_ch = '擊出高飛犧牲打';
      break;
    }
    case 'Coach visit the mound': {
      string_ch = '教練上投手丘';
      break;
    }
    case 'Run': {
      string_ch = '得分';
      break;
    }
    case 'Caught stealing': {
      string_ch = '盜壘失敗';
      break;
    }
    default: {
      string_ch = '';
      break;
    }
  }

  if (event === 'Ball' || event === 'Strike' || event === 'Pickoff attempt') {
    if (half === '0') {
      const temp =
        name !== ''
          ? name
          : mapTeam(
            data.api.data.competition.season.stage.group.event.participants[0]
              .name
          );
      out = temp + ' ' + string_ch;
    } else {
      const temp =
        name !== ''
          ? name
          : mapTeam(
            data.api.data.competition.season.stage.group.event.participants[1]
              .name
          );
      out = temp + ' ' + string_ch;
    }
  } else if (
    event === 'Batter in the box' ||
    event === 'Walk' ||
    event === 'Swing and miss' ||
    event === 'Strikeout' ||
    event === 'Out' ||
    event === 'Single' ||
    event === 'Double' ||
    event === 'Triple' ||
    event === 'Home run' ||
    event === 'Sacrifice hit' ||
    event === 'Run' ||
    event === 'Caught stealing'
  ) {
    if (name === '') {
      if (hitterName !== '') {
        name = hitterName;
      }
    }
    if (half === '0') {
      const temp =
        name !== ''
          ? name
          : mapTeam(
            data.api.data.competition.season.stage.group.event.participants[1]
              .name
          );
      out = temp + ' ' + string_ch;
    } else {
      const temp =
        name !== ''
          ? name
          : mapTeam(
            data.api.data.competition.season.stage.group.event.participants[0]
              .name
          );
      out = temp + ' ' + string_ch;
    }
  } else if (
    event === 'Stolen base' ||
    event === 'Foul' ||
    event === 'Not started' ||
    event === 'Pitcher change' ||
    event === 'Double play' ||
    event === 'Triple play' ||
    event === 'Wild pitch' ||
    event === 'Coach visit the mound'
  ) {
    out = string_ch;
  } else {
    const temp =
      name !== ''
        ? name
        : mapTeam(
          data.api.data.competition.season.stage.group.event.participants[0]
            .name
        );
    out = temp + ' ' + string_ch;
  }
  return out;
}
function changeInning(inning, now_innings) {
  let inningNow = 0;
  switch (inning) {
    case 'Not started': {
      inningNow = 1;
      break;
    }
    case 'Start delayed': {
      inningNow = 1;
      break;
    }
    case '1st inning': {
      inningNow = 1;
      break;
    }
    case '2nd inning': {
      inningNow = 2;
      break;
    }
    case 'Break after 1st inning': {
      inningNow = 2;
      break;
    }
    case '3rd inning': {
      inningNow = 3;
      break;
    }
    case 'Break after 2nd inning': {
      inningNow = 3;
      break;
    }
    case '4th inning': {
      inningNow = 4;
      break;
    }
    case 'Break after 3rd inning': {
      inningNow = 4;
      break;
    }
    case '5th inning': {
      inningNow = 5;
      break;
    }
    case 'Break after 4th inning': {
      inningNow = 5;
      break;
    }
    case '6th inning': {
      inningNow = 6;
      break;
    }
    case 'Break after 5th inning': {
      inningNow = 6;
      break;
    }
    case '7th inning': {
      inningNow = 7;
      break;
    }
    case 'Break after 6th inning': {
      inningNow = 7;
      break;
    }
    case '8th inning': {
      inningNow = 8;
      break;
    }
    case 'Break after 7th inning': {
      inningNow = 8;
      break;
    }
    case '9th inning': {
      inningNow = 9;
      break;
    }
    case 'Break after 8th inning': {
      inningNow = 9;
      break;
    }
    case '10th inning': {
      inningNow = 10;
      break;
    }
    case 'Break after 9th inning': {
      inningNow = 10;
      break;
    }
    case '11th inning': {
      inningNow = 11;
      break;
    }
    case 'Break after 10th inning': {
      inningNow = 11;
      break;
    }
    case '12th inning': {
      inningNow = 12;
      break;
    }
    case 'Break after 11th inning': {
      inningNow = 12;
      break;
    }
    case '13th inning': {
      inningNow = 13;
      break;
    }
    case 'Break after 12th inning': {
      inningNow = 13;
      break;
    }
    case '14th inning': {
      inningNow = 14;
      break;
    }
    case 'Break after 13th inning': {
      inningNow = 14;
      break;
    }
    case '15th inning': {
      inningNow = 15;
      break;
    }
    case 'Break after 14th inning': {
      inningNow = 15;
      break;
    }
    case '16th inning': {
      inningNow = 16;
      break;
    }
    case 'Break after 15th inning': {
      inningNow = 16;
      break;
    }
    case '17th inning': {
      inningNow = 17;
      break;
    }
    case 'Break after 16th inning': {
      inningNow = 17;
      break;
    }
    case '18th inning': {
      inningNow = 18;
      break;
    }
    case 'Break after 17th inning': {
      inningNow = 18;
      break;
    }
    case '19th inning': {
      inningNow = 19;
      break;
    }
    case 'Break after 18th inning': {
      inningNow = 19;
      break;
    }
    case '20th inning': {
      inningNow = 20;
      break;
    }
    case 'Break after 19th inning': {
      inningNow = 20;
      break;
    }
    case '21th inning': {
      inningNow = 21;
      break;
    }
    case 'Break after 20th inning': {
      inningNow = 21;
      break;
    }
    case '22th inning': {
      inningNow = 22;
      break;
    }
    case 'Break after 21th inning': {
      inningNow = 22;
      break;
    }
    case '23th inning': {
      inningNow = 23;
      break;
    }
    case 'Break after 22th inning': {
      inningNow = 23;
      break;
    }
    default: {
      inningNow = now_innings;
      break;
    }
  }
  return inningNow;
}

function mapTeam(team) {
  switch (team) {
    case 'Rakuten Monkeys': {
      return '樂天桃猿';
    }
    case 'Chinatrust Brothers': {
      return '中信兄弟';
    }
    case 'Fubon Guardians': {
      return '富邦悍將';
    }
    case 'Uni-President Lions': {
      return '統一獅';
    }
  }
}

module.exports = { CPBLpbpInplay, CPBLpbpHistory };
