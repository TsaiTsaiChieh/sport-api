const modules = require('../util/modules');

const ESoccerpbp = require('./pbpESoccer.js');

const ESoccerpbpInplay = ESoccerpbp.ESoccerpbpInplay;
const ESoccerpbpHistory = ESoccerpbp.ESoccerpbpHistory;

async function checkmatch_ESoccer() {
  const firestoreName = 'pagetest_eSoccer';

  const data = await modules.firestore.collection(firestoreName).get();
  const totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });
  const realtimeData = JSON.parse(
    JSON.stringify(
      // eslint-disable-next-line no-await-in-loop
      await modules.database.ref('esports/eSoccer').once('value')
    )
  );
  for (let i = 0; i < totalData.length; i++) {
    const betsID = totalData[i].bets_id;
    const gameTime = totalData[i].scheduled * 1000;
    const nowTime = Date.now();
    const eventStatus = totalData[i].flag.status;
    switch (eventStatus) {
      case 2: {
        if (gameTime <= nowTime) {
          const parameter = {
            betsID: betsID
          };
          ESoccerpbpInplay(parameter);
        } else {
          const ref = await modules.database.ref(
            `esports/eSoccer/${betsID}/Summary/status`
          );
          ref.set('scheduled');
        }
        break;
      }
      case 1: {
        if (realtimeData[`${betsID}`].Summary.status === 'inprogress') {
          const parameter = {
            betsID: betsID
          };
          ESoccerpbpInplay(parameter);
        }

        if (realtimeData[`${betsID}`].Summary.status === 'closed') {
          const parameter = {
            betsID: betsID
          };
          ESoccerpbpHistory(parameter);
        }
        break;
      }
      default: {
      }
    }
  }
}
module.exports = checkmatch_ESoccer;
