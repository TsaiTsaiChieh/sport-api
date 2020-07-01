const modules = require('../util/modules');
const db = require('../util/dbUtil');
const AppErrors = require('../util/AppErrors');
const settleMatchesModel = require('../model/user/settleMatchesModel');
const Match = db.Match;
const sport = 'basketball';
const league = 'CBA';
let eventNow = 0;
let eventOrderNow = 0;
let periodNow = '1';
// let memberHomeNow = 0;
// let memberAwayNow = 0;
async function CBApbpInplay(parameter) {
  // 14 秒一次
  let perStep;
  let timesPerLoop;
  if (parameter.first === 1) {
    // 最一開始需要初始化所以較長時間
    perStep = 50000;
    timesPerLoop = 2; // 一分鐘1次
  } else {
    perStep = 14000;
    timesPerLoop = 5; // 一分鐘4次
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
        if (realtimeData.Summary.Now_periods) {
          periodNow = realtimeData.Summary.Now_periods;
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

async function CBApbpHistory(parameter) {
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
    // here 隊員名稱 須以betsapi 輔助
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_clock`)
        .set('00:00');
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_periods`)
        .set('1');
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
            data.api.data.competition.season.stage.group.event.participants[1]
              .results[2].value,
          two_point_attempts:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[3].value,
          two_point_scored:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[4],
          two_point_percent:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[5].value,
          three_point_attempts:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[6].value,
          three_point_scored:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[7],
          three_point_percent:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[8].value,
          ft_point_attempts:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[9].value,
          ft_point_scored:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[10],
          ft_point_percent:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[11].value,
          rebounds:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[12].value,
          fouls:
            data.api.data.competition.season.stage.group.event.participants[0]
              .stats[13].value
        });

      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/info/away/Total`)
        .set({
          points:
            data.api.data.competition.season.stage.group.event.participants[1]
              .results[2].value,
          two_point_attempts:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[3].value,
          two_point_scored:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[4],
          two_point_percent:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[5].value,
          three_point_attempts:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[6].value,
          three_point_scored:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[7],
          three_point_percent:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[8].value,
          ft_point_attempts:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[9].value,
          ft_point_scored:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[10],
          ft_point_percent:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[11].value,
          rebounds:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[12].value,
          fouls:
            data.api.data.competition.season.stage.group.event.participants[1]
              .stats[13].value
        });
    } catch (err) {
      return reject(
        new AppErrors.FirebaseRealtimeError(
          `${err} at doPBP on ${betsID} by DY`
        )
      );
    }

    // 文字直撥
    const totalEvent =
      data.api.data.competition.season.stage.group.event.events_incidents
        .length;

    const eventEnd = totalEvent > eventNow + 2 ? eventNow + 2 : totalEvent;
    for (let eventCount = eventNow; eventCount < eventEnd; eventCount++) {
      eventNow = eventNow + 1;
      periodNow = changePeriod(
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].event_status_name,
        periodNow
      );
      const period =
        data.api.data.competition.season.stage.group.event.events_incidents[
          eventCount
        ].participant_id === null
          ? 'common'
          : data.api.data.competition.season.stage.group.event.events_incidents[
            eventCount
          ].participant_id === homeID
            ? '1'
            : '0';
      if (period !== periodNow && period === 'common') {
        eventOrderNow = 0;
      } else {
        eventOrderNow = eventOrderNow + 1;
      }

      try {
        if (period === 'common') {
          await modules.database
            .ref(
              `${sport}/${league}/${betsID}/Summary/periods${periodNow}/event${eventOrderNow}`
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
              id:
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].id
            });
        } else {
          await modules.database
            .ref(
              `${sport}/${league}/${betsID}/Summary/periods${periodNow}/event${eventOrderNow}`
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
                realtimeData,
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].participant_name,
                data.api.data.competition.season.stage.group.event
                  .events_incidents[eventCount].incident_name
              ),
              Period: period,
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
          .ref(`${sport}/${league}/${betsID}/Summary/Now_periods`)
          .set(periodNow);
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

async function writeBacktoReal(betsID) {
  return new Promise(async function(resolve, reject) {
    try {
      await modules.database
        .ref(`${sport}/${league}/${betsID}/Summary/Now_event`)
        .set(eventNow);
      await modules.database
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
    default: {
      return '通用';
    }
  }
}

function translateNormal(realtimeData, name, event) {
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
    out = name + ' ' + string_ch;
  }
  return out;
}

function changePeriod(period, now_periods) {
  let periodNow = 0;
  switch (period) {
    case '1st quarter' || 'Not started': {
      periodNow = '1';
      break;
    }
    case '2nd quarter' || 'Break after 1st quarter': {
      periodNow = '2';
      break;
    }
    case '3rd quarter' || 'Break after 2nd quarter': {
      periodNow = '3';
      break;
    }
    case '4th quarter' || 'Break after 3rd quarter': {
      periodNow = '4';
      break;
    }
    case '5th quarter' || 'Break after 4th quarter': {
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
