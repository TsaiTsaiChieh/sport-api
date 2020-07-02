const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const sport = 'baseball';
const league = 'CPBL';
let eventNow = 0;
let eventOrderNow = 0;
let hitterHomeNow = 0;
let hitterAwayNow = 0;
let pitcherHomeNow = 0;
let pitcherAwayNow = 0;
let inningNow = 1;
let halfNow = '0';
let memberHomeNow = 0;
let memberAwayNow = 0;
let pitcherHomeBalls = 0;
let pitcherHomeStrikes = 0;
let pitcherHomeER = 0;
let pitcherHomeH = 0;
let pitcherHomeK = 0;
let pitcherAwayBalls = 0;
let pitcherAwayStrikes = 0;
let pitcherAwayER = 0;
let pitcherAwayH = 0;
let pitcherAwayK = 0;
let hitterHomeAB = 0;
let hitterHomeH = 0;
let hitterAwayAB = 0;
let hitterAwayH = 0;
async function CPBLpbpInplay(parameter) {
  // 14 秒一次
  let perStep;
  let timesPerLoop;
  if (parameter.first === 1) {
    // 最一開始需要初始化所以較長時間
    perStep = 50000;
    timesPerLoop = 2; // 一分鐘1次
  } else {
    perStep = 14000;
    timesPerLoop = 5; // 一分鐘3次
  }

  const betsID = parameter.betsID;
  const statscoreID = parameter.statscoreID;

  const token = await queryForToken();
  const pbpURL = `https://api.statscore.com/v2/events/${statscoreID}?token=${token[0].token}`;
  let countForStatus2 = 0;
  const timerForStatus2 = setInterval(async function() {
    let realtimeData = await modules.database
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
        if (realtimeData.Summary.Now_hitter_home) {
          hitterHomeNow = realtimeData.Summary.Now_hitter_home;
        }
        if (realtimeData.Summary.Now_pitcher_home) {
          pitcherHomeNow = realtimeData.Summary.Now_pitcher_home;
        }
        if (realtimeData.Summary.Now_hitter_away) {
          hitterAwayNow = realtimeData.Summary.Now_hitter_away;
        }
        if (realtimeData.Summary.Now_pitcher_away) {
          pitcherAwayNow = realtimeData.Summary.Now_pitcher_away;
        }
        if (realtimeData.Summary.Now_member_home) {
          memberHomeNow = realtimeData.Summary.Now_member_home;
        }
        if (realtimeData.Summary.Now_member_away) {
          memberAwayNow = realtimeData.Summary.Now_member_away;
        }
        if (realtimeData.Summary.info.away) {
          if (realtimeData.Summary.Now_hitter_away !== 0) {
            hitterAwayAB =
              realtimeData.Summary.info.away.Now_lineup[
                `lineup${realtimeData.Summary.Now_hitter_away}`
              ].ab;
            hitterAwayH =
              realtimeData.Summary.info.away.Now_lineup[
                `lineup${realtimeData.Summary.Now_hitter_away}`
              ].h;
          }
          pitcherAwayBalls =
            realtimeData.Summary.info.away.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_away}`
            ].balls;
          pitcherAwayStrikes =
            realtimeData.Summary.info.away.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_away}`
            ].strikes;
          pitcherAwayER =
            realtimeData.Summary.info.away.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_away}`
            ].ER;
          pitcherAwayH =
            realtimeData.Summary.info.away.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_away}`
            ].h;
          pitcherAwayK =
            realtimeData.Summary.info.away.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_away}`
            ].k;
        }
        if (realtimeData.Summary.info.home) {
          if (realtimeData.Summary.Now_hitter_home !== 0) {
            hitterAwayAB =
              realtimeData.Summary.info.home.Now_lineup[
                `lineup${realtimeData.Summary.Now_hitter_home}`
              ].ab;

            hitterAwayH =
              realtimeData.Summary.info.home.Now_lineup[
                `lineup${realtimeData.Summary.Now_hitter_home}`
              ].h;
          }

          pitcherHomeBalls =
            realtimeData.Summary.info.home.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_home}`
            ].balls;

          pitcherHomeStrikes =
            realtimeData.Summary.info.home.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_home}`
            ].strikes;
          pitcherHomeER =
            realtimeData.Summary.info.home.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_home}`
            ].er;
          pitcherHomeH =
            realtimeData.Summary.info.home.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_home}`
            ].h;
          pitcherHomeK =
            realtimeData.Summary.info.home.Now_lineup[
              `lineup${realtimeData.Summary.Now_pitcher_home}`
            ].k;
        }
      }
    }
    const parameterPBP = {
      betsID: betsID,
      pbpURL: pbpURL,
      realtimeData: realtimeData,
      first: parameter.first
    };

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : pbp_statscore_${league} success`);
      clearInterval(timerForStatus2);
    } else {
      await doPBP(parameterPBP);
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
            `${err} at pbp${league} of Match on ${betsID} by DY`
          )
        );
      }
      try {
        await modules.database
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
        await settleMatchesModel({
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

async function doPBP(parameter) {
  return new Promise(async function(resolve, reject) {
    const betsID = parameter.betsID;
    const pbpURL = parameter.pbpURL;
    const realtimeData = parameter.realtimeData;
    let first = parameter.first;
    let pbpFlag = 1;

    const data = await axiosForURL(pbpURL);
    // check status of match
    if (
      data.api.data.competition.season.stage.group.event.status_type ===
      'finished'
    ) {
      try {
        await modules.database
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
          await modules.database
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
    } else if (
      data.api.data.competition.season.stage.group.event.status_type ===
      'Postponed'
    ) {
      try {
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/status`)
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
          .ref(`${sport}/${league}/${betsID}/Summary/status`)
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
          .ref(`${sport}/${league}/${betsID}/Summary/status`)
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
    // check the event is home or away

    // initial the realtime database

    if (first === 1) {
      await initRealtime(betsID, data);
      first = 0;
    } else {
      if (pbpFlag === 1) {
        await writeRealtime(betsID, realtimeData, data);
        await writeBacktoReal(betsID);
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
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/info/home/name`)
        .set(
          data.api.data.competition.season.stage.group.event.participants[0]
            .name
        );
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/name`)
        .set(
          data.api.data.competition.season.stage.group.event.participants[1]
            .name
        );
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    if (
      data.api.data.competition.season.stage.group.event.participants[0].lineups
        .length > 0
    ) {
      // 有lineup
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

      for (let playercount = 0; playercount < 9; playercount++) {
        try {
          await modules.database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${
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
              `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${
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
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP on ${betsID} by DY`
            )
          );
        }
      }
      // 投手
      await modules.database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup10`
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
          `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup10`
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
      // 教練
      await modules.database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup0`
        )
        .set({
          name: homeLineup[10].participant_name
        });
      await modules.database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup0`
        )
        .set({
          name: awayLineup[10].participant_name
        });
    }
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
        .set('0');
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_innings`)
        .set(1);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(0);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event_order`)
        .set(0);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_hitter_home`)
        .set(0);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Next1_hitter_home`)
        .set(1);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Next2_hitter_home`)
        .set(2);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_hitter_away`)
        .set(0);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Next1_hitter_away`)
        .set(1);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Next2_hitter_away`)
        .set(2);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_member_home`)
        .set(11);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_member_away`)
        .set(11);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_pitcher_home`)
        .set(10);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_pitcher_away`)
        .set(10);
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

async function writeRealtime(betsID, realtimeData, data) {
  return new Promise(async function(resolve, reject) {
    const homeID =
      data.api.data.competition.season.stage.group.event.participants[0].id;
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/info/home/Total`)
        .set({
          points:
            data.api.data.competition.season.stage.group.event.participants[0]
              .results[2].value,
          hits:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[0].value,
          errors:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[1].value
        });

      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/Total`)
        .set({
          points:
            data.api.data.competition.season.stage.group.event.participants[1]
              .results[2].value,
          hits:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[0].value,
          errors:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[1].value
        });
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    for (let count = 6; count < 15; count++) {
      try {
        if (
          data.api.data.competition.season.stage.group.event.participants[0]
            .results[count].value !== ''
        ) {
          await modules.database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/home/period${
                count - 5
              }`
            )
            .set({
              scoring: {
                points:
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
              `${sport}/${league}/${betsID}/Summary/info/away/period${
                count - 5
              }`
            )
            .set({
              scoring: {
                points:
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

    const totalEvent =
      data.api.data.competition.season.stage.group.event.events_incidents
        .length;

    const eventEnd = totalEvent > eventNow + 2 ? eventNow + 2 : totalEvent;
    for (let eventCount = eventNow; eventCount < eventEnd; eventCount++) {
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
        eventNow = eventNow + 1;
        continue;
      }

      eventNow = eventNow + 1;

      const half =
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].participant_id === null
          ? 'common'
          : data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].incident_id !== 504 &&
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].incident_id !== 2527 &&
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].incident_id !== 2522
              ? '1'
              : '0'
            : data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].incident_id !== 504 &&
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].incident_id !== 2527 &&
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].incident_id !== 2522
              ? '0'
              : '1';

      if (
        inningNow !==
        changeInning(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          inningNow
        )
      ) {
        eventOrderNow = 0;
        inningNow = changeInning(
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].event_status_name,
          inningNow
        );
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
          await modules.database
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
          await modules.database
            .ref(
              `${sport}/${league}/${betsID}/Summary/Innings${inningNow}/halfs${half}/event${eventOrderNow}`
            )
            .set({
              // 待翻譯
              description:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name +
                ' ' +
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name,
              description_ch: translateNormal(
                half,
                realtimeData,
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name,
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
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_innings`)
          .set(inningNow);
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_strikes`)
          .set(
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[17].value
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats[17].value
          );
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_outs`)
          .set(
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[18].value
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats[18].value
          );
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_balls`)
          .set(
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
              ? data.api.data.competition.season.stage.group.event
                .participants[0].stats[19].value
              : data.api.data.competition.season.stage.group.event
                .participants[1].stats[19].value
          );
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_firstbase`)
          .set(
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
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
          .ref(`${sport}/${league}/${betsID}/Summary/Now_secondbase`)
          .set(
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
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
          .ref(`${sport}/${league}/${betsID}/Summary/Now_thirdbase`)
          .set(
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
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
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP on ${betsID} by DY`
          )
        );
      }

      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 563
      ) {
        let resetFlag = 0;
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
        ) {
          try {
            hitterHomeNow =
              hitterHomeNow + 1 === 9 ? 9 : (hitterHomeNow + 1) % 9;
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_hitter_home`)
              .set(hitterHomeNow);
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Next1_hitter_home`)
              .set(hitterHomeNow + 1 === 9 ? 9 : (hitterHomeNow + 1) % 9);
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Next2_hitter_home`)
              .set(hitterHomeNow + 2 === 9 ? 9 : (hitterHomeNow + 2) % 9);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }

          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_name !== ''
          ) {
            // 有人名
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].participant_name !==
              realtimeData.Summary.info.home.Now_lineup[
                `lineup${hitterHomeNow}`
              ].name
            ) {
              resetFlag = 1;
              // 主隊有代打情況
              // 需再額外判斷api是否錯誤
              for (let pc = 1; pc < 10; pc++) {
                if (
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_name ===
                  realtimeData.Summary.info.home.Now_lineup[`lineup${pc}`].name
                ) {
                  resetFlag = 0;
                  break;
                }
              }
              if (resetFlag === 1) {
                const homeLineup = await data.api.data.competition.season.stage.group.event.participants[0].lineups.sort(
                  function(a, b) {
                    return a.id > b.id ? 1 : -1;
                  }
                );
                try {
                  await modules.database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${memberHomeNow}}`
                    )
                    .set(
                      realtimeData.Summary.info.home.Now_lineup[
                        `lineup${hitterHomeNow}`
                      ]
                    );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP on ${betsID} by DY`
                    )
                  );
                }
                // 將新的打擊手移到目前的order上
                try {
                  await modules.database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${hitterHomeNow}`
                    )
                    .set({
                      ab: 0,
                      h: 0,
                      id: homeLineup[memberHomeNow].id,
                      jersey_number: homeLineup[memberHomeNow].shirt_nr,
                      name: homeLineup[memberHomeNow].participant_name,
                      order: hitterHomeNow,
                      start: 0
                    });
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP on ${betsID} by DY`
                    )
                  );
                }
                memberHomeNow = memberHomeNow + 1;
                hitterHomeH = 0;
                hitterHomeAB = 0;
              }
            }
            if (resetFlag === 0) {
              try {
                hitterHomeAB =
                  realtimeData.Summary.info.home.Now_lineup[
                    `lineup${hitterHomeNow}`
                  ].ab;
                hitterHomeAB = hitterHomeAB + 1;
                await modules.database
                  .ref(
                    `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${hitterHomeNow}/ab`
                  )
                  .set(hitterHomeAB);
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP on ${betsID} by DY`
                  )
                );
              }
            } else {
              hitterHomeAB = hitterHomeAB + 1;
              try {
                await modules.database
                  .ref(
                    `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${hitterHomeNow}/ab`
                  )
                  .set(hitterHomeAB);
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP on ${betsID} by DY`
                  )
                );
              }
            }
          }
        } else {
          // 客隊
          hitterAwayNow = hitterAwayNow + 1 === 9 ? 9 : (hitterAwayNow + 1) % 9;
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_hitter_away`)
              .set(hitterAwayNow);
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Next1_hitter_away`)
              .set(hitterAwayNow + 1 === 9 ? 9 : (hitterAwayNow + 1) % 9);
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Next2_hitter_away`)
              .set(hitterAwayNow + 2 === 9 ? 9 : (hitterAwayNow + 2) % 9);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_name !== ''
          ) {
            // 有人名
            if (
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].participant_name !==
              realtimeData.Summary.info.away.Now_lineup[
                `lineup${hitterAwayNow}`
              ].name
            ) {
              resetFlag = 1;
              for (let pc = 1; pc < 10; pc++) {
                if (
                  data.api.data.competition.season.stage.group.event
                    .events_incidents[eventCount].participant_name ===
                  realtimeData.Summary.info.away.Now_lineup[`lineup${pc}`].name
                ) {
                  resetFlag = 0;
                  break;
                }
              }
              if (resetFlag === 1) {
                const awayLineup = await data.api.data.competition.season.stage.group.event.participants[1].lineups.sort(
                  function(a, b) {
                    return a.id > b.id ? 1 : -1;
                  }
                );
                try {
                  await modules.database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${memberAwayNow}`
                    )
                    .set(
                      realtimeData.Summary.info.away.Now_lineup[
                        `lineup${hitterAwayNow}`
                      ]
                    );
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP on ${betsID} by DY`
                    )
                  );
                }
                try {
                  await modules.database
                    .ref(
                      `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${hitterAwayNow}`
                    )
                    .set({
                      ab: 0,
                      h: 0,
                      id: awayLineup[memberAwayNow].id,
                      jersey_number: awayLineup[memberAwayNow].shirt_nr,
                      name: awayLineup[memberAwayNow].participant_name,
                      order: hitterAwayNow,
                      start: 0
                    });
                } catch (err) {
                  return reject(
                    new AppErrors.FirebaseRealtimeError(
                      `${err} at doPBP on ${betsID} by DY`
                    )
                  );
                }
                memberAwayNow = memberAwayNow + 1;
                hitterAwayH = 0;
                hitterAwayAB = 0;
              }
            }
            if (resetFlag === 0) {
              try {
                hitterAwayAB =
                  realtimeData.Summary.info.away.Now_lineup[
                    `lineup${hitterAwayNow}`
                  ].ab;
                hitterAwayAB = hitterAwayAB + 1;
                await modules.database
                  .ref(
                    `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${hitterAwayNow}/ab`
                  )
                  .set(hitterAwayAB);
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP on ${betsID} by DY`
                  )
                );
              }
            } else {
              try {
                hitterAwayAB = hitterAwayAB + 1;
                await modules.database
                  .ref(
                    `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${hitterAwayNow}/ab`
                  )
                  .set(hitterAwayAB);
              } catch (err) {
                return reject(
                  new AppErrors.FirebaseRealtimeError(
                    `${err} at doPBP on ${betsID} by DY`
                  )
                );
              }
            }
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 554
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          // 有 lineup
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            hitterAwayAB = hitterAwayAB - 1;
            await modules.database
              .ref(
                `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${hitterAwayNow}/ab`
              )
              .set(hitterAwayAB);
          } else {
            hitterHomeAB = hitterHomeAB - 1;
            await modules.database
              .ref(
                `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${hitterHomeNow}/ab`
              )
              .set(hitterHomeAB);
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 553 ||
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 2528
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              hitterHomeAB = hitterHomeAB - 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${hitterHomeNow}/ab`
                )
                .set(hitterHomeAB);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          } else {
            try {
              hitterAwayAB = hitterAwayAB - 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${hitterAwayNow}/ab`
                )
                .set(hitterAwayAB);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 559
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              await modules.database
                .ref(`${sport}/${league}/${betsID}/Summary/Now_pitcher_home`)
                .set(memberHomeNow);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
            const homeLineup = await data.api.data.competition.season.stage.group.event.participants[0].lineups.sort(
              function(a, b) {
                return a.id > b.id ? 1 : -1;
              }
            );
            try {
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${memberHomeNow}`
                )
                .set({
                  balls: 0,
                  er: 0,
                  h: 0,
                  id: homeLineup[memberHomeNow].id,
                  ip: 0,
                  jersey_number: homeLineup[memberHomeNow].shirt_nr,
                  k: 0,
                  name: homeLineup[memberHomeNow].participant_name,
                  order: memberHomeNow,
                  start: 0,
                  strikes: 0
                });
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
            memberHomeNow = memberHomeNow + 1;
            pitcherHomeBalls = 0;
            pitcherHomeStrikes = 0;
            pitcherHomeER = 0;
            pitcherHomeH = 0;
            pitcherHomeK = 0;
          } else {
            try {
              await modules.database
                .ref(`${sport}/${league}/${betsID}/Summary/Now_pitcher_away`)
                .set(memberAwayNow);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
            const awayLineup = await data.api.data.competition.season.stage.group.event.participants[1].lineups.sort(
              function(a, b) {
                return a.id > b.id ? 1 : -1;
              }
            );
            try {
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${memberAwayNow}`
                )
                .set({
                  balls: 0,
                  er: 0,
                  h: 0,
                  id: awayLineup[memberAwayNow].id,
                  ip: 0,
                  jersey_number: awayLineup[memberAwayNow].shirt_nr,
                  k: 0,
                  name: awayLineup[memberAwayNow].participant_name,
                  order: memberAwayNow,
                  start: 0,
                  strikes: 0
                });
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
            memberAwayNow = memberAwayNow + 1;
            pitcherAwayBalls = 0;
            pitcherAwayStrikes = 0;
            pitcherAwayER = 0;
            pitcherAwayH = 0;
            pitcherAwayK = 0;
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 501
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              pitcherAwayER =
                realtimeData.Summary.info.away.Now_lineup[
                  `lineup${pitcherAwayNow}`
                ].er;
              pitcherAwayER = pitcherAwayER + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${pitcherAwayNow}/er`
                )
                .set(pitcherAwayER);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          } else {
            try {
              // 主隊投手er+1
              pitcherHomeER =
                realtimeData.Summary.info.home.Now_lineup[
                  `lineup${pitcherAwayNow}`
                ].er;
              pitcherHomeER = pitcherHomeER + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${pitcherHomeNow}/er`
                )
                .set(pitcherHomeER);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          }
        }
      }

      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 520
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              pitcherAwayK =
                realtimeData.Summary.info.away.Now_lineup[
                  `lineup${pitcherAwayNow}`
                ].k;
              pitcherAwayK = pitcherAwayK + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${pitcherAwayNow}/k`
                )
                .set(pitcherAwayK);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          } else {
            try {
              pitcherHomeK =
                realtimeData.Summary.info.home.Now_lineup[
                  `lineup${pitcherHomeNow}`
                ].k;
              pitcherHomeK = pitcherHomeK + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${pitcherHomeNow}/k`
                )
                .set(pitcherHomeK);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 562
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              hitterHomeH =
                realtimeData.Summary.info.home.Now_lineup[
                  `lineup${hitterHomeNow}`
                ].h;
              hitterHomeH = hitterHomeH + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${hitterHomeNow}/h`
                )
                .set(hitterHomeH);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
            try {
              pitcherAwayH =
                realtimeData.Summary.info.away.Now_lineup[
                  `lineup${pitcherAwayNow}`
                ].h;
              pitcherAwayH = pitcherAwayH + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${pitcherAwayNow}/h`
                )
                .set(pitcherAwayH);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          } else {
            try {
              hitterAwayH =
                realtimeData.Summary.info.away.Now_lineup[
                  `lineup${hitterAwayNow}`
                ].h;
              hitterAwayH = hitterAwayH + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${hitterAwayNow}/h`
                )
                .set(hitterAwayH);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
            try {
              pitcherHomeH =
                realtimeData.Summary.info.home.Now_lineup[
                  `lineup${pitcherHomeNow}`
                ].h;
              pitcherHomeH = pitcherHomeH + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${pitcherHomeNow}/h`
                )
                .set(pitcherHomeH);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 503 ||
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 520
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              pitcherAwayStrikes =
                realtimeData.Summary.info.away.Now_lineup[
                  `lineup${pitcherAwayNow}`
                ].strikes;
              pitcherAwayStrikes = pitcherAwayStrikes + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${pitcherAwayNow}/strikes`
                )
                .set(pitcherAwayStrikes);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          } else {
            try {
              pitcherHomeStrikes =
                realtimeData.Summary.info.home.Now_lineup[
                  `lineup${pitcherHomeNow}`
                ].strikes;
              pitcherHomeStrikes = pitcherHomeStrikes + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${pitcherHomeNow}/strikes`
                )
                .set(pitcherHomeStrikes);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          }
        }
      }
      if (
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].incident_id === 504
      ) {
        halfNow =
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '0'
            : '1';
        if (halfNow !== realtimeData.Summary.Now_halfs) {
          try {
            await modules.database
              .ref(`${sport}/${league}/${betsID}/Summary/Now_halfs`)
              .set(halfNow);
          } catch (err) {
            return reject(
              new AppErrors.FirebaseRealtimeError(
                `${err} at doPBP on ${betsID} by DY`
              )
            );
          }
        }
        if (
          data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_name !== ''
        ) {
          if (
            data.api.data.competition.season.stage.group.event.events_incidents[
              eventCount
            ].participant_id === homeID
          ) {
            try {
              pitcherHomeBalls =
                realtimeData.Summary.info.home.Now_lineup[
                  `lineup${pitcherHomeNow}`
                ].balls;
              pitcherHomeBalls = pitcherHomeBalls + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup${pitcherHomeNow}/balls`
                )
                .set(pitcherHomeBalls);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          } else {
            try {
              pitcherAwayBalls =
                realtimeData.Summary.info.away.Now_lineup[
                  `lineup${pitcherAwayNow}`
                ].balls;
              pitcherAwayBalls = pitcherAwayBalls + 1;
              await modules.database
                .ref(
                  `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup${pitcherAwayNow}/balls`
                )
                .set(pitcherAwayBalls);
            } catch (err) {
              return reject(
                new AppErrors.FirebaseRealtimeError(
                  `${err} at doPBP on ${betsID} by DY`
                )
              );
            }
          }
        }
      }
    }
    resolve('ok');
  });
}

async function writeBacktoReal(betsID) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(eventNow);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event_order`)
        .set(eventOrderNow);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_member_home`)
        .set(memberHomeNow);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_member_away`)
        .set(memberAwayNow);
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
    default: {
      return '通用';
    }
  }
}

function translateNormal(half, realtimeData, name, event) {
  let out;
  let string_ch;

  switch (event) {
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
    default: {
      string_ch = '';
      break;
    }
  }

  if (event === 'Ball' || event === 'Strike' || event === 'Pickoff attempt') {
    if (half === '0') {
      out =
        realtimeData.Summary.info.away.Now_lineup[
          `lineup${realtimeData.Summary.Now_pitcher_away}`
        ].name +
        ' ' +
        string_ch;
    } else {
      out =
        realtimeData.Summary.info.home.Now_lineup[
          `lineup${realtimeData.Summary.Now_pitcher_home}`
        ].name +
        ' ' +
        string_ch;
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
    event === 'Sacrifice hit'
  ) {
    if (half === '0') {
      if (hitterAwayNow === 0) {
        out =
          realtimeData.Summary.info.away.Now_lineup[
            `lineup${hitterAwayNow + 1}`
          ].name +
          ' ' +
          string_ch;
      } else {
        out =
          realtimeData.Summary.info.away.Now_lineup[`lineup${hitterAwayNow}`]
            .name +
          ' ' +
          string_ch;
      }
    } else {
      if (hitterHomeNow === 0) {
        out =
          realtimeData.Summary.info.home.Now_lineup[
            `lineup${hitterHomeNow + 1}`
          ].name +
          ' ' +
          string_ch;
      } else {
        out =
          realtimeData.Summary.info.home.Now_lineup[`lineup${hitterHomeNow}`]
            .name +
          ' ' +
          string_ch;
      }
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
    out = name + ' ' + string_ch;
  }
  return out;
}
function changeInning(inning, now_innings) {
  let inningNow = 0;
  switch (inning) {
    case '1st inning': {
      inningNow = 1;
      break;
    }
    case '2nd inning' || 'Break after 1st inning': {
      inningNow = 2;
      break;
    }
    case '3rd inning' || 'Break after 2nd inning': {
      inningNow = 3;
      break;
    }
    case '4th inning' || 'Break after 3rd inning': {
      inningNow = 4;
      break;
    }
    case '5th inning' || 'Break after 4th inning': {
      inningNow = 5;
      break;
    }
    case '6th inning' || 'Break after 5th inning': {
      inningNow = 6;
      break;
    }
    case '7th inning' || 'Break after 6th inning': {
      inningNow = 7;
      break;
    }
    case '8th inning' || 'Break after 7th inning': {
      inningNow = 8;
      break;
    }
    case '9th inning' || 'Break after 8th inning': {
      inningNow = 9;
      break;
    }
    case '10th inning' || 'Break after 9th inning': {
      inningNow = 10;
      break;
    }
    case '11th inning' || 'Break after 10th inning': {
      inningNow = 11;
      break;
    }
    case '12th inning' || 'Break after 11th inning': {
      inningNow = 12;
      break;
    }
    case '13th inning' || 'Break after 12th inning': {
      inningNow = 13;
      break;
    }
    case '14th inning' || 'Break after 13th inning': {
      inningNow = 14;
      break;
    }
    case '15th inning' || 'Break after 14th inning': {
      inningNow = 15;
      break;
    }
    case '16th inning' || 'Break after 15th inning': {
      inningNow = 16;
      break;
    }
    case '17th inning' || 'Break after 16th inning': {
      inningNow = 17;
      break;
    }
    case '18th inning' || 'Break after 17th inning': {
      inningNow = 18;
      break;
    }
    case '19th inning' || 'Break after 18th inning': {
      inningNow = 19;
      break;
    }
    case '20th inning' || 'Break after 19th inning': {
      inningNow = 20;
      break;
    }
    case '21th inning' || 'Break after 20th inning': {
      inningNow = 21;
      break;
    }
    case '22th inning' || 'Break after 21th inning': {
      inningNow = 22;
      break;
    }
    case '23th inning' || 'Break after 22th inning': {
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
module.exports = { CPBLpbpInplay, CPBLpbpHistory };
