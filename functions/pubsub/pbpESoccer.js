const modules = require('../util/modules');
const db = require('../util/dbUtil');
const firestoreName = 'pagetest_eSoccer';

// 14 秒一次
const perStep = 14000;
// 一分鐘4次
const timesPerLoop = 4;
const Match = db.Match;
async function ESoccerpbpInplay(parameter) {
  const betsID = parameter.betsID;
  const pbpURL = `https://api.betsapi.com/v1/event/view?token=${modules.betsToken}&event_id=${betsID}`;
  let countForStatus2 = 0;

  const parameterPBP = {
    betsID: betsID,
    pbpURL: pbpURL
  };
  const timerForStatus2 = setInterval(async function () {
    await doPBP(parameterPBP);

    countForStatus2 = countForStatus2 + 1;
    if (countForStatus2 >= timesPerLoop) {
      console.log(`${betsID} : checkmatch_ESoccer success`);
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function ESoccerpbpHistory(parameter) {
  const betsID = parameter.betsID;
  const pbpURL = `https://api.betsapi.com/v1/event/view?token=${modules.betsToken}&event_id=${betsID}`;
  const { data } = await modules.axios(pbpURL);

  const ref = await modules.firestore
    .collection(`${firestoreName}_PBP`)
    .doc(betsID);

  if (!data.results[0].timer) {
    data.results[0].timer = { tm: 'xx', ts: 'xx' };
  }
  if (!data.results[0].ss) {
    data.results[0].ss = 'no data';
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

  let homeScores = 'no data';
  let awayScores = 'no data';
  if (data.results[0].ss !== null) {
    homeScores = data.results[0].ss.split('-')[0];
    awayScores = data.results[0].ss.split('-')[1];
  }

  await ref.set(
    {
      league: {
        name: data.results[0].league.name,
        id: data.results[0].league.id
      },
      Now_clock: `${data.results[0].timer.tm}:${data.results[0].timer.ts}`,
      home: {
        name: data.results[0].home.name,
        Total: {
          score: homeScores,
          attacks: data.results[0].stats.attacks[0],
          ball_safe: data.results[0].stats.ball_safe[0],
          corners: data.results[0].stats.corners[0],
          dangerous_attacks: data.results[0].stats.dangerous_attacks[0],
          goals: data.results[0].stats.goals[0],
          off_target: data.results[0].stats.off_target[0],
          on_target: data.results[0].stats.on_target[0],
          yellowcards: data.results[0].stats.yellowcards[0],
          redcards: data.results[0].stats.redcards[0]
        }
      },
      away: {
        name: data.results[0].away.name,
        Total: {
          score: awayScores,
          attacks: data.results[0].stats.attacks[1],
          ball_safe: data.results[0].stats.ball_safe[1],
          corners: data.results[0].stats.corners[1],
          dangerous_attacks: data.results[0].stats.dangerous_attacks[1],
          goals: data.results[0].stats.goals[1],
          off_target: data.results[0].stats.off_target[1],
          on_target: data.results[0].stats.on_target[1],
          yellowcards: data.results[0].stats.yellowcards[1],
          redcards: data.results[0].stats.redcards[1]
        }
      }
    },
    { merge: true }
  );
  await modules.firestore
    .collection('pagetest_eSoccer')
    .doc(betsID)
    .set({ flag: { status: 0 } }, { merge: true });

  await Match.upsert({
    bets_id: betsID,
    home_points: homeScores,
    away_points: awayScores,
    status: 0
  });
  await modules.database
    .ref(`esports/eSoccer/${betsID}/Summary/status`)
    .set('closed');
}
async function doPBP(parameter) {
  const betsID = parameter.betsID;
  const pbpURL = parameter.pbpURL;
  const realtimeData = await JSON.parse(
    JSON.stringify(
      await modules.database.ref(`esports/eSoccer/${betsID}`).once('value')
    )
  );
  const { data } = await modules.axios(pbpURL);

  if (data.results[0].time_status === '3') {
    if (realtimeData.Summary.status !== 'closed') {
      await modules.database
        .ref(`esports/eSoccer/${betsID}/Summary/status`)
        .set('closed');
    }
  }

  if (data.results[0].time_status === '2') {
    if (realtimeData.Summary.status !== 'inprogress') {
      await modules.database
        .ref(`esports/eSoccer/${betsID}/Summary/status`)
        .set('inprogress');

      await Match.upsert({
        bets_id: betsID,
        status: 1
      });
      await modules.firestore
        .collection(firestoreName)
        .doc(betsID)
        .set({ flag: { status: 1 } }, { merge: true });
    }
  }
  if (data.results[0].time_status === '1') {
    if (realtimeData.Summary.status !== 'inprogress') {
      await modules.database
        .ref(`esports/eSoccer/${betsID}/Summary/status`)
        .set('inprogress');

      await Match.upsert({
        bets_id: betsID,
        status: 1
      });
      await modules.firestore
        .collection(firestoreName)
        .doc(betsID)
        .set({ flag: { status: 1 } }, { merge: true });
    }
  }

  let homeScores = 'no data';
  let awayScores = 'no data';

  if (!data.results[0].timer) {
    data.results[0].timer = { tm: 'xx', ts: 'xx' };
  }
  if (!data.results[0].ss) {
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

  let ref = modules.database.ref(`esports/eSoccer/${betsID}/Summary/league`);
  await ref.set({
    name: data.results[0].league.name,
    id: data.results[0].league.id
  });
  ref = modules.database.ref(`esports/eSoccer/${betsID}/Summary/Now_clock`);
  await ref.set(`${data.results[0].timer.tm}:${data.results[0].timer.ts}`);
  ref = modules.database.ref(`esports/eSoccer/${betsID}/Summary/info`);
  await ref.set({
    home: {
      name: data.results[0].home.name,
      Total: {
        score: homeScores,
        attacks: data.results[0].stats.attacks[0],
        ball_safe: data.results[0].stats.ball_safe[0],
        corners: data.results[0].stats.corners[0],
        dangerous_attacks: data.results[0].stats.dangerous_attacks[0],
        goals: data.results[0].stats.goals[0],
        off_target: data.results[0].stats.off_target[0],
        on_target: data.results[0].stats.on_target[0],
        yellowcards: data.results[0].stats.yellowcards[0],
        redcards: data.results[0].stats.redcards[0]
      }
    },
    away: {
      name: data.results[0].away.name,
      Total: {
        score: awayScores,
        attacks: data.results[0].stats.attacks[1],
        ball_safe: data.results[0].stats.ball_safe[1],
        corners: data.results[0].stats.corners[1],
        dangerous_attacks: data.results[0].stats.dangerous_attacks[1],
        goals: data.results[0].stats.goals[1],
        off_target: data.results[0].stats.off_target[1],
        on_target: data.results[0].stats.on_target[1],
        yellowcards: data.results[0].stats.yellowcards[1],
        redcards: data.results[0].stats.redcards[1]
      }
    }
  });
}
module.exports = { ESoccerpbpInplay, ESoccerpbpHistory };
