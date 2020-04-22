import { SBLpbpInplay } from './pbpSBL';

const modules = require('../util/modules');
const SBLpbp = require('./pbpSBL.js');
checkmatch_SBL();
async function checkmatch_SBL () {
  const firestoreName = 'basketball_SBL';

  const data = await modules.firestore.collection(firestoreName).get();
  const totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });
  // totalData.length
  for (let i = 0; i < 1; i++) {
    const betsID = totalData[i].bets_id;
    const gameID = totalData[i].radar_id;
    const gameTime = totalData[i].scheduled._seconds * 1000;
    const nowTime = Date.now();
    const eventStatus = totalData[i].flag.status;
    if (eventStatus === 1) {
      const realtimeData = JSON.parse(
        JSON.stringify(
          // eslint-disable-next-line no-await-in-loop
          await modules.database.ref(`basketball/SBL/${betsID}`).once('value')
        )
      );
      let periodsNow;
      let periodName;
      let eventNow;
      if (
        realtimeData.Summary.status === 'closed' ||
        realtimeData.Summary.status === 'ended'
      ) {
        // eslint-disable-next-line no-undef
        await SBLpbpHistory(gameID, betsID);
      } else if (realtimeData.Summary.status === 'inprogress') {
        periodsNow = Object.keys(realtimeData.PBP).length - 1; // how much periods
        periodName = Object.keys(realtimeData.PBP);
        eventNow =
          Object.keys(realtimeData.PBP[periodName[periodsNow]]).length - 1;

        await SBLpbpInplay(gameID, betsID, periodsNow, eventNow);
      } else {
        periodsNow = 0; // realtime database has no data
        periodName = 'periods0';
        eventNow = 0;

        await SBLpbpInplay(gameID, betsID, periodsNow, eventNow);
      }
    }

    if (eventStatus === 2) {
      if (gameTime <= nowTime) {
        const periodsNow = 0;
        const eventNow = 0;

        // eslint-disable-next-line no-await-in-loop
        await SBLpbpInplay(gameID, betsID, periodsNow, eventNow);
      }
    }
  }
}
