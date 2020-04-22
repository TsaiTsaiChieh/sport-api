const modules = require('../util/modules');
const NBApbp = require('./pbpNBA.js');
const NBApbpInplay = NBApbp.NBApbpInplay;
const NBApbpHistory = NBApbp.NBApbpHistory;
async function checkmatch_NBA () {
  const firestoreName = 'page_NBA';

  // maybe from firestore to mysql
  const data = await modules.firestore.collection(firestoreName).get();
  const totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });

  for (let i = 0; i < totalData.length; i++) {
    const betsID = totalData[i].bets_id;
    const gameID = totalData[i].radar_id;
    const gameTime = totalData[i].scheduled._seconds * 1000;
    const nowTime = Date.now();
    let periodsNow;
    let periodName;
    let eventsNow;
    const eventStatus = totalData[i].flag.status;
    if (eventStatus === 2) {
      if (gameTime <= nowTime) {
        periodsNow = 0;
        eventsNow = 0;
        const parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventsNow: eventsNow
        };
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(parameter);
      }
    } else {
      const ref = await modules.database.ref(`basketball/NBA/${betsID}/Summary/status`);
      ref.set('scheduled');
    }
    if (eventStatus === 1) {
      const realtimeData = JSON.parse(
        JSON.stringify(
          // eslint-disable-next-line no-await-in-loop
          await modules.database.ref(`basketball/NBA/${betsID}`).once('value')
        )
      );

      if (realtimeData.Summary.status === 'created') {
        periodsNow = 0;
        periodName = 'periods0';
        eventsNow = 0;
        const parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventsNow: eventsNow
        };
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(parameter);
      } else if (
        realtimeData.Summary.status === 'closed' ||
        realtimeData.Summary.status === 'complete'
      ) {
        // eslint-disable-next-line no-await-in-loop
        const parameter = {
          gameID: gameID,
          betsID: betsID
        };
        await NBApbpHistory(parameter);
      } else if (realtimeData.Summary.status === 'inprogress') {
        periodsNow = Object.keys(realtimeData.PBP).length - 1; // how much periods
        periodName = Object.keys(realtimeData.PBP);
        eventsNow =
          Object.keys(realtimeData.PBP[periodName[periodsNow]]).length - 1;

        const parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventsNow: eventsNow
        };
        // eslint-disable-next-line no-await-in-loop
        await NBApbpInplay(parameter);
      } else {
        periodsNow = 0;
        periodName = 'periods0';
        eventsNow = 0;
        const parameter = {
          gameID: gameID,
          betsID: betsID,
          periodsNow: periodsNow,
          eventsNow: eventsNow
        };
        await NBApbpInplay(parameter);
      }
    }
  }
}

module.exports = checkmatch_NBA;
