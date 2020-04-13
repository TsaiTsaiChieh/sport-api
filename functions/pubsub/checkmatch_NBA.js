const modules = require('../util/modules');
const NBApbp = require('./pbpNBA.js');
const NBApbpInplay = NBApbp.NBApbpInplay;
const NBApbpHistory = NBApbp.NBApbpHistory;

async function checkmatch_NBA() {
  const firestoreName = 'page_NBA';

  // maybe from firestore to mysql
  let data = await modules.firestore.collection(firestoreName).get();
  let totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });

  for (let i = 0; i < totalData.length; i++) {
    let betsID = totalData[i].bets_id;
    let gameID = totalData[i].radar_id;
    let gameTime = totalData[i].scheduled._seconds * 1000;
    let nowTime = Date.now();

    let eventStatus = totalData[i].flag.status;
    if (eventStatus === 2) {
      if (gameTime <= nowTime) {
        periodsNow = 0;
        eventNow = 0;
        let parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventNow: eventNow,
        };
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(parameter);
      }
    }
    if (eventStatus === 1) {
      let realtimeData;
      realtimeData = JSON.parse(
        JSON.stringify(
          // eslint-disable-next-line no-await-in-loop
          await modules.database.ref(`basketball/NBA/${betsID}`).once('value')
        )
      );
      let periodsNow;
      let periodName;
      let eventNow;

      if (realtimeData.Summary.status === 'created') {
        periodsNow = 0;
        periodName = 'periods0';
        eventNow = 0;
        let parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventNow: eventNow,
        };
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(parameter);
      } else if (
        realtimeData.Summary.status === 'closed' ||
        realtimeData.Summary.status === 'complete'
      ) {
        // eslint-disable-next-line no-await-in-loop
        await NBApbpHistory(gameID, betsID);
      } else if (realtimeData.Summary.status === 'inprogress') {
        periodsNow = Object.keys(realtimeData.PBP).length - 1; //how much periods
        periodName = Object.keys(realtimeData.PBP);
        eventNow =
          Object.keys(realtimeData.PBP[periodName[periodsNow]]).length - 1;

        let parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventNow: eventNow,
        };
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(parameter);
      } else {
        periodsNow = 0;
        periodName = 'periods0';
        eventNow = 0;
        let parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventNow: eventNow,
        };
        await NBApbpInplay(parameter);
      }
    }
  }
}

module.exports = checkmatch_NBA;
