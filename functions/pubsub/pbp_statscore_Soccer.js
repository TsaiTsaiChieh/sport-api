const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const sport = 'Soccer';
const league = 'Soccer';
let eventNow = 0;
let halfNow = '0';
//let clockNow = '';
async function SoccerpbpInplay(parameter) {
  let perStep;
  let timesPerLoop;
  if (parameter.first === 1) {
    // 最一開始需要初始化所以較長時間
    perStep = 50000;
    timesPerLoop = 2; // 一分鐘1次
  } else {
    perStep = 14000;
    timesPerLoop = 2; // 一分鐘4次
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
        if (realtimeData.Summary.Now_half) {
          halfNow = realtimeData.Summary.halfNow;
        }
        //if (realtimeData.Summary.Now_clock) {
        //  clockNow = realtimeData.Summary.Now_clock;
        //}
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

async function SoccerpbpHistory(parameter) {
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
          new AppErrors.PBPEsoccerError(
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
        await writeRealtime(betsID, data);
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
        playercount < homeLineup.length - 1;
        playercount++
      ) {
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
              participant_id: homeLineup[playercount].participant_id,
              start: homeLineup[playercount].bench === '' ? 1 : 0
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
        playercount < awayLineup.length - 1;
        playercount++
      ) {
        try {
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
              participant_id: awayLineup[playercount].participant_id,
              start: awayLineup[playercount].bench === '' ? 1 : 0
            });
        } catch (err) {
          return reject(
            new AppErrors.FirebaseRealtimeError(
              `${err} at doPBP on ${betsID} by DY`
            )
          );
        }
      }
      await modules.database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/home/Now_lineup/lineup0`
        )
        .set({
          name: homeLineup[homeLineup.length - 1].participant_name
        });
      await modules.database
        .ref(
          `${sport}/${league}/${betsID}/Summary/info/away/Now_lineup/lineup0`
        )
        .set({
          name: awayLineup[awayLineup.length - 1].participant_name
        });
    }
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(0);
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_half`)
        .set('0');
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
        .set('00:00');
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

async function writeRealtime(betsID, data) {
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
          shot_on_target:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[0].value,
          shot_off_target:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[1].value,
          attack:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[2].value,
          dangerous_attack:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[3].value,
          corners:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[4].value,
          yellow_cards:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[5].value,
          red_cards:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[6].value,
          ball_possession:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[30].value,
          ball_possession_percentage:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[31].value
        });

      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/Total`)
        .set({
          points:
            data.api.data.competition.season.stage.group.event.participants[1]
              .results[2].value,
          shot_on_target:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[0].value,
          shot_off_target:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[1].value,
          attack:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[2].value,
          dangerous_attack:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[3].value,
          corners:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[4].value,
          yellow_cards:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[5].value,
          red_cards:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[6].value,
          ball_possession:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[30].value,
          ball_possession_percentage:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[31].value
        });
      if (halfNow === '0') {
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
          .set(
            changeTime(
              data.api.data.competition.season.stage.group.event.clock_time,
              0
            )
          );
      } else {
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
          .set(
            changeTime(
              data.api.data.competition.season.stage.group.event.clock_time,
              2700
            )
          );
      }
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }
    for (let count = 4; count < 7; count++) {
      try {
        if (
          data.api.data.competition.season.stage.group.event.participants[0]
            .results[count].value !== ''
        ) {
          await modules.database
            .ref(
              `${sport}/${league}/${betsID}/Summary/info/home/Half${count - 3}`
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
              `${sport}/${league}/${betsID}/Summary/info/away/Half${count - 3}`
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
    for (let eventCount = eventNow; eventCount < totalEvent; eventCount++) {
      eventNow = eventNow + 1;
      halfNow = changeHalf(
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].event_status_name,
        halfNow
      );
      // here pbp
      const eventType =
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].participant_id === null
          ? 'common'
          : data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';

      try {
        await modules.database
          .ref(
            `${sport}/${league}/${betsID}/Summary/Livetext/event${eventCount}`
          )
          .set({
            description:
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].participant_name +
              ' ' +
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_name,
            description_ch: translate(
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].participant_name,
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].incident_name
            ),
            Half: eventType === 'common' ? '2' : eventType,
            id:
              data.api.data.competition.season.stage.group.event
                .events_incidents[eventCount].id
          });
        // here
        await modules.database
          .ref(`${sport}/${league}/${betsID}/Summary/Now_half`)
          .set(halfNow);
      } catch (err) {
        return reject(
          new AppErrors.FirebaseRealtimeError(
            `${err} at doPBP on ${betsID} by DY`
          )
        );
      }
    }
    return resolve('ok');
  });
}

async function writeBacktoReal(betsID) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(eventNow);
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

function changeHalf(half, now_halfs) {
  let halfN = 0;
  switch (half) {
    case '1st half': {
      halfN = '1';
      break;
    }
    case 'Not started': {
      halfN = '1';
      break;
    }
    case '2nd half' || 'Halftime': {
      halfN = '2';
      break;
    }
    case '3rd half': {
      halfN = '3';
      break;
    }
    case '4th half': {
      halfN = '4';
      break;
    }
    default: {
      halfN = now_halfs;
      break;
    }
  }
  return halfN;
}

function translate(name, event) {
  let out = '';
  let string_ch;
  switch (event) {
    case '1st half started': {
      string_ch = '上半場開始';
      break;
    }
    case '2nd half started': {
      string_ch = '下半場開始';
      break;
    }
    case 'Attack': {
      string_ch = '攻擊';
      break;
    }
    case 'Dangerous attack': {
      string_ch = '危險攻擊';
      break;
    }
    case 'Free kick': {
      string_ch = '進行自由球';
      break;
    }
    case 'Dangerous free kick': {
      string_ch = '進行危險自由球';
      break;
    }
    case 'Shot on target': {
      string_ch = '射正球門';
      break;
    }
    case 'Shot off target': {
      string_ch = '射歪球門';
      break;
    }
    case 'Goal kick': {
      string_ch = '守門員開球';
      break;
    }
    case 'Corner': {
      string_ch = '進行角球';
      break;
    }
    case 'Throw in': {
      string_ch = '投擲界外球';
      break;
    }
    case 'Foul': {
      string_ch = '失誤';
      break;
    }
    case 'Shot blocked': {
      string_ch = '擋住射門';
      break;
    }
    case 'Goalkeeper saved': {
      string_ch = '守門員擋下射門';
      break;
    }
    case 'Goal': {
      string_ch = '進球';
      break;
    }
    case 'Injury': {
      string_ch = '受傷';
      break;
    }
    case 'Offside': {
      string_ch = '越位';
      break;
    }
    case 'Red card': {
      string_ch = '拿到紅牌';
      break;
    }
    case 'Yellow card': {
      string_ch = '拿到黃牌';
      break;
    }
    case 'Penalty': {
      string_ch = '犯規';
      break;
    }
    case 'Penalty goal': {
      string_ch = '踢進點球';
      break;
    }
    case 'Missed penalty': {
      string_ch = '沒踢進點球';
      break;
    }
    case 'Own goal': {
      string_ch = '踢進烏龍球';
      break;
    }
    case 'Goal cancelled': {
      string_ch = '射門無效';
      break;
    }
    case 'Shot woodwork': {
      string_ch = '射中球門';
      break;
    }
    case 'Not started': {
      string_ch = '比賽尚未開始';
      break;
    }
    case 'Extratime 1st half started': {
      string_ch = '加賽上半局開始';
      break;
    }
    case 'Extratime 2nd half started': {
      string_ch = '加賽下半局開始';
      break;
    }
    case 'Penalty shootout started': {
      string_ch = '點球大戰開始';
      break;
    }
    case 'Finished after extratime': {
      string_ch = '加時結束';
      break;
    }
    case 'Finished after penalties': {
      string_ch = '點球結束';
      break;
    }
    case 'Finished regular time': {
      string_ch = '比賽結束';
      break;
    }
    case 'Start delayed': {
      string_ch = '比賽延遲開始';
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
    case 'Abandoned': {
      string_ch = '放棄比賽';
      break;
    }
    case 'Halftime': {
      string_ch = '中場休息';
      break;
    }
    case 'Waiting for extratime': {
      string_ch = '等待加時';
      break;
    }
    case 'Extratime halftime': {
      string_ch = '加時賽中場休息';
      break;
    }
    case 'Waiting for penalty': {
      string_ch = '等待點球';
      break;
    }
    case 'Added time': {
      string_ch = '傷停補時';
      break;
    }
    case 'Substitution out': {
      string_ch = '被換下場';
      break;
    }
    case 'Substitution in': {
      string_ch = '被換上場';
      break;
    }
    case 'To finish': {
      string_ch = '比賽完成';
      break;
    }
    case 'Water break': {
      string_ch = '水停';
      break;
    }
    case "Referee's injury": {
      string_ch = '裁判受傷';
      break;
    }
    case 'Break during the game': {
      string_ch = '賽中休息';
      break;
    }
    case 'Kick off': {
      string_ch = '比賽開始';
      break;
    }
  }
  out = name + ' ' + string_ch;
  return out;
}

function changeTime(time, offset) {
  // change time to 'xx:xx'
  const finalTime = time + offset;
  return `${Math.floor(finalTime / 60)}:${finalTime % 60}`;
}
module.exports = { SoccerpbpInplay, SoccerpbpHistory };
