const modules = require('../util/modules');

const ESoccerpbp = require('./pbpESoccer.js');

const EsoccerpbpInplay = ESoccerpbp.EsoccerpbpInplay;
const EsoccerpbpHistory = ESoccerpbp.EsoccerpbpHistory;

async function checkmatch_eSoccer() {
  // const firestoreName = 'eSoccer'; normal
  const firestoreName = 'pagetest_eSoccer';

  const data = await modules.firestore.collection(firestoreName).get();
  const totalData = [];
  data.forEach((doc) => {
    totalData.push(doc.data());
  });
  for (let i = 0; i < totalData.length; i++) {
    const betsID = totalData[i].bets_id;
    const gameTime = totalData[i].scheduled;
    const nowTime = Date.now();
    const eventStatus = totalData[i].flag.status;
    switch (eventStatus) {
      case 2: {
        if (gameTime <= nowTime) {
          const parameter = {
            betsID: betsID
          };
          EsoccerpbpInplay(parameter);
        } else {
          const ref = await modules.database.ref(
            `esports/eSoccer/${betsID}/Summary/status`
          );
          ref.set('scheduled');
        }
        break;
      }
      case 1: {
        const realtimeData = JSON.parse(
          JSON.stringify(
            // eslint-disable-next-line no-await-in-loop
            await modules.database.ref(`baseball/MLB/${betsID}`).once('value')
          )
        );
        //
        if (realtimeData.Summary.status === 1) {
          const parameter = {
            betsID: betsID
          };
          EsoccerpbpInplay(parameter);
        }
        if (realtimeData.Summary.status === 2) {
          const parameter = {
            betsID: betsID
          };
          EsoccerpbpInplay(parameter);
        }
        if (realtimeData.Summary.status === 3) {
          const parameter = {
            betsID: betsID
          };
          EsoccerpbpHistory(parameter);
        }
        break;
      }
      default: {
      }
    }
  }
}
module.exports = checkmatch_eSoccer;
