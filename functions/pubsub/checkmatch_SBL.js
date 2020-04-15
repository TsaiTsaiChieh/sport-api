const modules = require('../util/modules');
const SBLpbp = require('./pbpSBL.js');
checkmatch_SBL();
async function checkmatch_SBL() {
  const firestoreName = 'basketball_SBL';

  let data = await modules.firestore.collection(firestoreName).get();
  let totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });
  //totalData.length
  for (let i = 0; i < 1; i++) {
    let betsID = totalData[i].bets_id;
    let gameID = totalData[i].radar_id;
    let gameTime = totalData[i].scheduled._seconds * 1000;
    let nowTime = Date.now();
    let eventStatus = totalData[i].flag.status;
    if (eventStatus === 1) {
      let realtimeData;
      realtimeData = JSON.parse(
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
        // eslint-disable-next-line no-await-in-loop
        await SBLpbpHistory(gameID, betsID);
      } else if (realtimeData.Summary.status === 'inprogress') {
        periodsNow = Object.keys(realtimeData.PBP).length - 1; //how much periods
        periodName = Object.keys(realtimeData.PBP);
        eventNow =
          Object.keys(realtimeData.PBP[periodName[periodsNow]]).length - 1;

        // eslint-disable-next-line no-await-in-loop
        await SBLpbpInplay(gameID, betsID, periodsNow, eventNow);
      } else {
        periodsNow = 0; //realtime database has no data
        periodName = 'periods0';
        eventNow = 0;

        await SBLpbpInplay(gameID, betsID, periodsNow, eventNow);
      }
    }

    if (eventStatus === 2) {
      if (gameTime <= nowTime) {
        periodsNow = 0;
        eventNow = 0;

        // eslint-disable-next-line no-await-in-loop
        await SBLpbpInplay(gameID, betsID, periodsNow, eventNow);
      }
    }
  }
}
