const firebaseAdmin = require('../util/firebaseUtil');
const firestore = firebaseAdmin().firestore();
const database = firebaseAdmin().database();
const axios = require('axios');
const firestoreName = 'pagetest';
const sbl_api_key = '8hhpmvusugeguqdwkuf4ftmu';
// 14 秒一次
const perStep = 14000;
// 一分鐘4次
const timesPerLoop = 4;
async function SBLpbpInplay(gameID, betsID, periodsNow, eventsNow) {
  let countForStatus2 = 0;
  const pbpURL = `http://api.sportradar.us/basketball/trial/v2/en/sport_events/sr:match:${gameID}/timeline.json?api_key=${sbl_api_key}`;

  const timerForStatus2 = setInterval(async function() {
    try {
      const { data } = await axios(pbpURL);
      let ref = database.ref(`basketball/SBL/${betsID}/Summary/status`);
      await ref.set(data.sport_event_status.status);

      // call summary to get player information
      // scores, blocks, assists, minutes
      ref = database.ref(`basketball/SBL/${betsID}/Summary/homepoints`);
      await ref.set(data.home.points);
      ref = database.ref(`basketball/SBL/${betsID}/Summary/awaypoints`);
      await ref.set(data.away.points);
    } catch (error) {
      console.log(
        'error happened in pubsub/NBApbpInplay function by page',
        error
      );
    }

    countForStatus2 = countForStatus2 + 1;

    if (countForStatus2 >= timesPerLoop) {
      firestore
        .collection(firestoreName)
        .doc(betsID)
        .set({ flag: { status: 1 } }, { merge: true });
      clearInterval(timerForStatus2);
    }
  }, perStep);
}
async function SBLpbpHistory(gameID, betsID) {
  const pbpURL = `http://api.sportradar.us/basketball/trial/v2/en/sport_events/sr:match:${gameID}/timeline.json?api_key=${sbl_api_key}`;
  try {
    await axios(pbpURL);
  } catch (error) {
    console.log(
      'error happened in pubsub/NBApbpHistory function by page',
      error
    );
    return error;
  }
  // change the status to 1
  firestore
    .collection(firestoreName)
    .doc(betsID)
    .set({ flag: { status: 0 } }, { merge: true });
}

module.exports = { SBLpbpInplay, SBLpbpHistory };
